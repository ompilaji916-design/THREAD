import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, ArrowBigUp } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";

interface Complaint { _id: string; category: string; description: string; location: string; status: string; upvotes: string[]; isAnonymous: boolean; }

export default function Complaints() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: "Infrastructure", description: "", location: "", isAnonymous: false });

  const { data } = useQuery<Complaint[]>({ queryKey: ["complaints"], queryFn: async () => (await api.get("/campus/complaints")).data.data });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description) return toast.error("Description required");
    try {
      await api.post("/campus/complaints", form);
      toast.success("Complaint submitted");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["complaints"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not submit"); }
  };

  const upvote = async (id: string) => { await api.post(`/campus/complaints/${id}/upvote`); qc.invalidateQueries({ queryKey: ["complaints"] }); };
  const statusTone: Record<string, "neutral" | "warning" | "success" | "danger"> = { Pending: "neutral", "In Progress": "warning", Resolved: "success", Closed: "danger" };

  return (
    <div>
      <PageHeader title="Complaint Portal" subtitle="Raise campus issues — track resolution with a 72h SLA." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />New Complaint</Button>} />
      <div className="space-y-3">
        {data?.map((c) => (
          <Card key={c._id} className="flex justify-between items-start gap-3 flex-wrap">
            <div>
              <div className="flex gap-2 mb-1"><Badge tone="neutral">{c.category}</Badge><Badge tone={statusTone[c.status]}>{c.status}</Badge></div>
              <p className="text-sm text-textsub">{c.description}</p>
              {c.location && <p className="text-xs text-textmuted mt-1">📍 {c.location}</p>}
            </div>
            <button onClick={() => upvote(c._id)} className="flex items-center gap-1 text-sm text-textmuted hover:text-accent"><ArrowBigUp size={18} />{c.upvotes.length}</button>
          </Card>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Complaint">
        <form onSubmit={submit} className="space-y-3">
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Infrastructure</option><option>Wifi</option><option>Mess Food</option><option>Cleanliness</option><option>Safety</option><option>Other</option>
          </Select>
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <textarea className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-borderc" placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} /> Submit anonymously</label>
          <Button type="submit" className="w-full">Submit Complaint</Button>
        </form>
      </Modal>
    </div>
  );
}
