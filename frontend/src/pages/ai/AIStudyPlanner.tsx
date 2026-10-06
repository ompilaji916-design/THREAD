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
import { Badge } from "../../components/ui/Badge";

interface Task { text: string; done: boolean; }
interface Day { date: string; tasks: Task[]; isRevision: boolean; }
interface Plan { _id: string; examName: string; examDate: string; days: Day[]; }

export default function AIStudyPlanner() {
  const qc = useQueryClient();
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState(2);
  const [subjects, setSubjects] = useState([{ name: "", difficulty: "Medium" }]);
  const [loading, setLoading] = useState(false);

  const { data: plans } = useQuery<Plan[]>({ queryKey: ["study-plans"], queryFn: async () => (await api.get("/ai/study-plan")).data.data });

  const addSubject = () => setSubjects((s) => [...s, { name: "", difficulty: "Medium" }]);
  const updateSubject = (i: number, field: string, value: string) => setSubjects((s) => s.map((x, idx) => idx === i ? { ...x, [field]: value } : x));
  const removeSubject = (i: number) => setSubjects((s) => s.filter((_, idx) => idx !== i));

  const create = async () => {
    if (!examName || !examDate || subjects.some((s) => !s.name)) return toast.error("Fill in exam name, date, and subjects");
    setLoading(true);
    try {
      await api.post("/ai/study-plan", { examName, examDate, subjects, dailyHours, prepLevel: "Intermediate" });
      toast.success("Study plan created!");
      qc.invalidateQueries({ queryKey: ["study-plans"] });
      setExamName(""); setExamDate(""); setSubjects([{ name: "", difficulty: "Medium" }]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not create plan");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (planId: string, dayIndex: number, taskIndex: number) => {
    await api.patch("/ai/study-plan/task", { planId, dayIndex, taskIndex });
    qc.invalidateQueries({ queryKey: ["study-plans"] });
  };

  return (
    <div>
      <PageHeader title="AI Study Planner" subtitle="Get a day-by-day plan built around your exam date and subject difficulty." />
      <Card className="mb-6">
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <Input label="Exam Name" value={examName} onChange={(e) => setExamName(e.target.value)} />
          <Input label="Exam Date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <Input label="Daily Hours" type="number" min={1} max={12} value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value))} />
        </div>
        {subjects.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2 items-end">
            <div className="flex-1"><Input label={i === 0 ? "Subject" : undefined} value={s.name} onChange={(e) => updateSubject(i, "name", e.target.value)} /></div>
            <div className="w-32">
              <Select label={i === 0 ? "Difficulty" : undefined} value={s.difficulty} onChange={(e) => updateSubject(i, "difficulty", e.target.value)}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </Select>
            </div>
            <Button variant="ghost" onClick={() => removeSubject(i)}><Trash2 size={18} /></Button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <Button variant="secondary" onClick={addSubject}><Plus size={16} className="inline mr-1" />Add Subject</Button>
          <Button loading={loading} onClick={create}>Generate Plan</Button>
        </div>
      </Card>

      {plans?.map((plan) => (
        <Card key={plan._id} className="mb-4">
          <h4 className="font-bold text-textmain mb-3">{plan.examName} — {new Date(plan.examDate).toLocaleDateString()}</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {plan.days.map((day, di) => (
              <div key={di} className="border border-borderc rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{day.date}</p>
                  {day.isRevision && <Badge tone="accent">Revision Day</Badge>}
                </div>
                {day.tasks.map((t, ti) => (
                  <label key={ti} className="flex items-center gap-2 text-sm text-textsub py-0.5">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(plan._id, di, ti)} />
                    <span className={t.done ? "line-through text-textmuted" : ""}>{t.text}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
