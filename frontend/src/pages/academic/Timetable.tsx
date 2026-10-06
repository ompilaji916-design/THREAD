import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";

interface Slot { _id: string; day: string; startTime: string; endTime: string; subject: string; type: string; room: string; }
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Timetable() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ day: "Mon", startTime: "09:00", endTime: "10:00", subject: "", type: "Lecture", room: "" });

  const { data } = useQuery<Slot[]>({ queryKey: ["timetable"], queryFn: async () => (await api.get("/timetable")).data.data });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject) return toast.error("Subject is required");
    try {
      const res = await api.post("/timetable", form);
      toast.success(res.data.message);
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["timetable"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not add class");
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/timetable/${id}`);
    qc.invalidateQueries({ queryKey: ["timetable"] });
  };

  return (
    <div>
      <PageHeader title="Timetable" subtitle="Your weekly class schedule." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />Add Class</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {DAYS.map((day) => (
          <div key={day}>
            <h4 className="font-bold text-textsub mb-2">{day}</h4>
            <div className="space-y-2">
              {data?.filter((s) => s.day === day).map((s) => (
                <Card key={s._id} className="!p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-textmain">{s.subject}</p>
                      <p className="text-xs text-textmuted">{s.startTime}–{s.endTime}</p>
                      <p className="text-xs text-textmuted">{s.type}{s.room ? ` · ${s.room}` : ""}</p>
                    </div>
                    <button onClick={() => remove(s._id)} className="text-textmuted hover:text-danger"><Trash2 size={14} /></button>
                  </div>
                </Card>
              ))}
              {!data?.filter((s) => s.day === day).length && <p className="text-xs text-textmuted">No classes</p>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Class">
        <form onSubmit={create} className="space-y-4">
          <Select label="Day" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <Input label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Lecture</option><option>Lab</option><option>Tutorial</option><option>Seminar</option>
          </Select>
          <Input label="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <Button type="submit" className="w-full">Add Class</Button>
        </form>
      </Modal>
    </div>
  );
}
