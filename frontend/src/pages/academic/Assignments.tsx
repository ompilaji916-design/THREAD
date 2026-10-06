import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, ListTodo } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";

interface Assignment {
  _id: string; title: string; subject: string; deadline: string; priority: string; status: string;
}

const PRIORITY_TONE: Record<string, "danger" | "warning" | "neutral"> = { High: "danger", Medium: "warning", Low: "neutral" };

export default function Assignments() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", deadline: "", priority: "Medium", description: "" });

  const { data, isLoading } = useQuery<{ items: Assignment[]; stats: any }>({
    queryKey: ["assignments", filter, "false"],
    queryFn: async () => (await api.get(`/assignments?archived=false${filter !== "All" ? `&status=${filter}` : ""}`)).data.data,
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.deadline) return toast.error("Title and deadline required");
    try {
      await api.post("/assignments", form);
      toast.success("Assignment added");
      setModalOpen(false);
      setForm({ title: "", subject: "", deadline: "", priority: "Medium", description: "" });
      qc.invalidateQueries({ queryKey: ["assignments"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not add assignment");
    }
  };

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/assignments/${id}`, { status });
    qc.invalidateQueries({ queryKey: ["assignments"] });
  };

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle={data?.stats ? `${data.stats.total} open · ${data.stats.overdue} overdue · ${data.stats.dueSoon} due soon` : undefined}
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />New Assignment</Button>}
      />

      <div className="flex gap-2 mb-4">
        {["All", "Not Started", "Working", "Done"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter === s ? "bg-accent text-white" : "bg-white border border-borderc text-textsub"}`}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? null : !data?.items?.length ? (
        <EmptyState icon={<ListTodo size={48} />} title="No assignments" message="You're all caught up — or add a new one." ctaLabel="New Assignment" onCta={() => setModalOpen(true)} />
      ) : (
        <div className="space-y-3">
          {data.items.map((a) => {
            const overdue = new Date(a.deadline) < new Date() && a.status !== "Done";
            return (
              <Card key={a._id} className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-bold text-textmain">{a.title}</h4>
                  <p className="text-sm text-textmuted">{a.subject} · Due {new Date(a.deadline).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={PRIORITY_TONE[a.priority]}>{a.priority}</Badge>
                  {overdue && <Badge tone="danger">Overdue</Badge>}
                  <Select value={a.status} onChange={(e) => setStatus(a._id, e.target.value)} className="!min-h-0 py-1 text-sm">
                    <option>Not Started</option><option>Working</option><option>Done</option>
                  </Select>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Assignment">
        <form onSubmit={create} className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input label="Deadline" type="datetime-local" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option>High</option><option>Medium</option><option>Low</option>
          </Select>
          <Button type="submit" className="w-full">Add Assignment</Button>
        </form>
      </Modal>
    </div>
  );
}
