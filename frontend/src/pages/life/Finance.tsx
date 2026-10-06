import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";

const CATEGORIES = ["Food", "Transport", "Shopping", "College", "Recharge", "Outings", "Emergency", "Health", "Hostel", "Other"];
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899", "#14B8A6", "#F97316", "#8B5CF6", "#64748B"];

export default function Finance() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: "", category: "Food", note: "" });
  const [budgetLimit, setBudgetLimit] = useState("");

  const { data: expenses } = useQuery({ queryKey: ["expenses"], queryFn: async () => (await api.get("/finance/expenses")).data.data });
  const { data: budget } = useQuery({ queryKey: ["budget"], queryFn: async () => (await api.get("/finance/budget")).data.data });

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount) return toast.error("Amount required");
    try {
      await api.post("/finance/expenses", { ...expenseForm, amount: Number(expenseForm.amount) });
      toast.success("Expense logged");
      setModalOpen(false);
      setExpenseForm({ amount: "", category: "Food", note: "" });
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budget"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not log expense"); }
  };

  const saveBudget = async () => {
    await api.put("/finance/budget", { monthlyLimit: Number(budgetLimit) || 0 });
    toast.success("Budget saved");
    qc.invalidateQueries({ queryKey: ["budget"] });
  };

  const chartData = Object.entries(expenses?.byCategory || {}).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="PocketGuard" subtitle="Track expenses and stay within budget." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />Log Expense</Button>} />

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <Card>
          <h3 className="font-bold text-textmain mb-3">Monthly Budget</h3>
          <p className="text-3xl font-extrabold text-textmain mb-1">₹{budget?.spent ?? 0} <span className="text-base text-textmuted">/ ₹{budget?.monthlyLimit ?? 0}</span></p>
          <p className="text-sm text-textmuted mb-3">Health score: {budget?.healthScore ?? 100}/100</p>
          <div className="flex gap-2">
            <Input placeholder="Set monthly limit (₹)" type="number" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} />
            <Button onClick={saveBudget}>Save</Button>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-textmain mb-3">Spending by Category</h3>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-textmuted">No expenses logged yet.</p>}
        </Card>
      </div>

      <h3 className="font-bold text-textmain mb-3">Recent Expenses</h3>
      <div className="space-y-2">
        {expenses?.items?.slice(0, 10).map((e: any) => (
          <Card key={e._id} className="!p-3 flex justify-between items-center">
            <div><p className="text-sm font-medium text-textmain">{e.category}</p><p className="text-xs text-textmuted">{e.note}</p></div>
            <p className="font-bold text-textmain">₹{e.amount}</p>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Expense">
        <form onSubmit={addExpense} className="space-y-3">
          <Input label="Amount (₹)" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          <Select label="Category" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Note" value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
          <Button type="submit" className="w-full">Log Expense</Button>
        </form>
      </Modal>
    </div>
  );
}
