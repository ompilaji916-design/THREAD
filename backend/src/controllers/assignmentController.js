import { Assignment } from "../models/Assignment.js";

export async function listAssignments(req, res) {
  const { status, archived } = req.query;
  const filter = { userId: req.user.userId, archived: archived === "true" };
  if (status && status !== "All") filter.status = status;
  const items = await Assignment.find(filter).sort({ deadline: 1 });
  const all = await Assignment.find({ userId: req.user.userId, archived: false });
  const now = new Date();
  const stats = {
    total: all.length,
    overdue: all.filter((a) => new Date(a.deadline) < now && a.status !== "Done").length,
    dueSoon: all.filter((a) => new Date(a.deadline) - now < 48 * 3600 * 1000 && new Date(a.deadline) > now && a.status !== "Done").length,
    completed: all.filter((a) => a.status === "Done").length,
  };
  res.json({ success: true, data: { items, stats } });
}

export async function createAssignment(req, res) {
  const { title, subject, deadline, priority, description, expectedMarks } = req.body;
  if (!title || !deadline) return res.status(400).json({ success: false, error: "Title and deadline are required", code: "MISSING_FIELDS" });
  const assignment = await Assignment.create({ userId: req.user.userId, title, subject, deadline, priority, description, expectedMarks });
  res.status(201).json({ success: true, data: assignment, message: "Assignment added" });
}

export async function updateAssignment(req, res) {
  const assignment = await Assignment.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { new: true });
  if (!assignment) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  res.json({ success: true, data: assignment, message: "Updated" });
}

export async function deleteAssignment(req, res) {
  await Assignment.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true, message: "Deleted" });
}

export async function bulkUpdate(req, res) {
  const { ids, action } = req.body; // action: 'done' | 'delete'
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ success: false, error: "ids required", code: "MISSING_FIELDS" });
  if (action === "delete") {
    await Assignment.deleteMany({ _id: { $in: ids }, userId: req.user.userId });
  } else {
    await Assignment.updateMany({ _id: { $in: ids }, userId: req.user.userId }, { status: "Done" });
  }
  res.json({ success: true, message: "Bulk action complete" });
}
