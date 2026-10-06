import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";

interface Req { _id: string; type: string; description: string; roomNumber: string; priority: string; status: string; }

export default function Hostel() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: "Electrical", description: "", roomNumber: "" });

  const { data } = useQuery<Req[]>({ queryKey: ["hostel-requests"], queryFn: async () => (await api.get("/campus/hostel-requests")).data.data });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.roomNumber) return toast.error("Fill in all fields");
    try {
      await api.post("/campus/hostel-requests", form);
      toast.success("Request submitted");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["hostel-requests"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not submit"); }
  };

  const statusTone: Record<string, "neutral" | "warning" | "success"> = { Submitted: "neutral", "In Progress": "warning", Resolved: "success" };

  return (
    <div>
      <PageHeader title="Hostel HelpDesk" subtitle="Report maintenance issues in your room." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />New Request</Button>} />
      <div className="space-y-3">
        {data?.map((r) => (
          <Card key={r._id} className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-textmain">{r.type} — Room {r.roomNumber}</h4>
              <p className="text-sm text-textmuted">{r.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge tone={r.priority === "High" ? "danger" : "neutral"}>{r.priority}</Badge>
              <Badge tone={statusTone[r.status]}>{r.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Hostel Request">
        <form onSubmit={submit} className="space-y-3">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Electrical</option><option>Plumbing</option><option>Furniture</option><option>Wifi</option><option>Other</option>
          </Select>
          <Input label="Room Number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
          <textarea className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-borderc" placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" className="w-full">Submit Request</Button>
        </form>
      </Modal>
    </div>
  );
}
