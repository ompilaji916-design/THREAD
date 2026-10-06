import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Heart, CalendarDays } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";

interface Notice {
  _id: string; title: string; content: string; category: string; priority: string;
  reactions: string[]; isEvent: boolean; eventDate?: string; rsvps: string[]; userId: { name: string };
}

export default function CampusMate() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "General", priority: "Normal", isEvent: false, eventDate: "" });

  const { data } = useQuery<Notice[]>({ queryKey: ["notices"], queryFn: async () => (await api.get("/campus/notices")).data.data });

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error("Title and content required");
    try {
      const res = await api.post("/campus/notices", form);
      toast.success(res.data.message);
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["notices"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not post"); }
  };

  const react = async (id: string) => { await api.post(`/campus/notices/${id}/react`); qc.invalidateQueries({ queryKey: ["notices"] }); };
  const rsvp = async (id: string) => { await api.post(`/campus/notices/${id}/rsvp`); qc.invalidateQueries({ queryKey: ["notices"] }); };

  const priorityTone: Record<string, "danger" | "warning" | "neutral"> = { Emergency: "danger", High: "warning", Normal: "neutral", Low: "neutral" };

  return (
    <div>
      <PageHeader title="CampusMate Notice Board" subtitle="Announcements, events, and campus updates." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />Post Notice</Button>} />
      <div className="space-y-3">
        {data?.map((n) => (
          <Card key={n._id}>
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={priorityTone[n.priority]}>{n.priority}</Badge>
              <Badge tone="neutral">{n.category}</Badge>
              {n.isEvent && n.eventDate && <span className="text-xs text-textmuted flex items-center gap-1"><CalendarDays size={12} />{new Date(n.eventDate).toLocaleDateString()}</span>}
            </div>
            <h4 className="font-bold text-textmain">{n.title}</h4>
            <p className="text-sm text-textsub mt-1">{n.content}</p>
            <p className="text-xs text-textmuted mt-2">— {n.userId?.name}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => react(n._id)} className="flex items-center gap-1 text-sm text-textmuted hover:text-danger"><Heart size={16} />{n.reactions.length}</button>
              {n.isEvent && <Button variant="secondary" onClick={() => rsvp(n._id)}>RSVP ({n.rsvps.length})</Button>}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post Notice">
        <form onSubmit={post} className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-borderc" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>General</option><option>Event</option><option>Academic</option><option>Emergency</option>
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Normal</option><option>High</option><option>Emergency</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isEvent} onChange={(e) => setForm({ ...form, isEvent: e.target.checked })} /> This is an event</label>
          {form.isEvent && <Input label="Event Date" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />}
          <Button type="submit" className="w-full">Post (+10 XP)</Button>
        </form>
      </Modal>
    </div>
  );
}
