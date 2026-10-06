import { Expense } from "../models/Expense.js";
import { Budget } from "../models/Budget.js";
import { BillSplit } from "../models/BillSplit.js";
import { notify } from "../services/notificationService.js";

// ---- Expenses ----
export async function listExpenses(req, res) {
  const items = await Expense.find({ userId: req.user.userId }).sort({ date: -1 });
  const byCategory = {};
  items.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  res.json({ success: true, data: { items, byCategory } });
}
export async function createExpense(req, res) {
  const { amount, category, note, date } = req.body;
  if (!amount || !category) return res.status(400).json({ success: false, error: "amount and category required", code: "MISSING_FIELDS" });
  const expense = await Expense.create({ userId: req.user.userId, amount, category, note, date: date || new Date() });

  const budget = await Budget.findOne({ userId: req.user.userId });
  if (budget && budget.monthlyLimit > 0) {
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const monthExpenses = await Expense.find({ userId: req.user.userId, date: { $gte: startOfMonth } });
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const consumedPct = (total / budget.monthlyLimit) * 100;
    if (consumedPct >= 100 && budget.lastAlertLevel < 100) {
      await notify(req.user.userId, { type: "budget_exceeded", title: "Budget Exceeded!", message: `You've spent ₹${total} of your ₹${budget.monthlyLimit} budget.`, priority: "high" });
      budget.lastAlertLevel = 100; await budget.save();
    } else if (consumedPct >= 80 && budget.lastAlertLevel < 80) {
      await notify(req.user.userId, { type: "budget_warning", title: "80% of Budget Used", message: `You've used 80% of your monthly budget.` });
      budget.lastAlertLevel = 80; await budget.save();
    }
  }
  res.status(201).json({ success: true, data: expense, message: "Expense logged" });
}
export async function deleteExpense(req, res) {
  await Expense.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true, message: "Deleted" });
}

// ---- Budget ----
export async function getBudget(req, res) {
  let budget = await Budget.findOne({ userId: req.user.userId });
  if (!budget) budget = await Budget.create({ userId: req.user.userId });
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const monthExpenses = await Expense.find({ userId: req.user.userId, date: { $gte: startOfMonth } });
  const spent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const healthScore = budget.monthlyLimit === 0 ? 100 : Math.max(0, Math.round(100 - (spent / budget.monthlyLimit) * 100));
  res.json({ success: true, data: { ...budget.toObject(), spent, healthScore } });
}
export async function updateBudget(req, res) {
  const { monthlyLimit, savingsGoal, categoryLimits } = req.body;
  const budget = await Budget.findOneAndUpdate(
    { userId: req.user.userId },
    { monthlyLimit, savingsGoal, categoryLimits, lastAlertLevel: 0 },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: budget, message: "Budget saved" });
}

// ---- Bill Splitter ----
export async function listBillSplits(req, res) {
  const items = await BillSplit.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}
export async function createBillSplit(req, res) {
  const { title, totalAmount, people } = req.body;
  if (!title || !totalAmount || !Array.isArray(people) || people.length === 0) {
    return res.status(400).json({ success: false, error: "title, totalAmount, and people required", code: "MISSING_FIELDS" });
  }
  const equalShare = totalAmount / people.length;
  const withShares = people.map((p) => ({ name: p.name, share: p.share || equalShare, paid: false }));
  const split = await BillSplit.create({ userId: req.user.userId, title, totalAmount, people: withShares });
  res.status(201).json({ success: true, data: split, message: "Bill split created" });
}
export async function updateBillSplit(req, res) {
  const split = await BillSplit.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { new: true });
  if (!split) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  res.json({ success: true, data: split });
}
