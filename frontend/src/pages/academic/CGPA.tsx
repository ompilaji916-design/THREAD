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

interface SubjectGrade { name: string; credits: number; grade: string; }
interface Semester { _id: string; semesterNumber: number; subjects: SubjectGrade[]; sgpa: number; }

const GRADES = ["O", "A+", "A", "B+", "B", "C", "F"];

export default function CGPA() {
  const qc = useQueryClient();
  const { data } = useQuery<{ semesters: Semester[]; cgpa: number }>({
    queryKey: ["cgpa"],
    queryFn: async () => (await api.get("/cgpa")).data.data,
  });

  const [semesterNumber, setSemesterNumber] = useState(1);
  const [subjects, setSubjects] = useState<SubjectGrade[]>([{ name: "", credits: 3, grade: "A" }]);

  const updateSubject = (i: number, field: keyof SubjectGrade, value: string) => {
    setSubjects((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: field === "credits" ? Number(value) : value } : s));
  };
  const addRow = () => setSubjects((prev) => [...prev, { name: "", credits: 3, grade: "A" }]);
  const removeRow = (i: number) => setSubjects((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (subjects.some((s) => !s.name.trim())) return toast.error("Fill in all subject names");
    try {
      const res = await api.post("/cgpa/semester", { semesterNumber, subjects });
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["cgpa"] });
      setSubjects([{ name: "", credits: 3, grade: "A" }]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not save semester");
    }
  };

  const deleteSem = async (id: string) => {
    await api.delete(`/cgpa/semester/${id}`);
    qc.invalidateQueries({ queryKey: ["cgpa"] });
  };

  return (
    <div>
      <PageHeader title="CGPA Calculator" subtitle="Enter grades per semester to track your CGPA." />

      <Card className="mb-6">
        <h3 className="font-bold text-textmain mb-3">Cumulative CGPA</h3>
        <p className="text-4xl font-extrabold text-accent">{data?.cgpa ? data.cgpa.toFixed(2) : "—"}</p>
      </Card>

      <Card className="mb-6">
        <h3 className="font-bold text-textmain mb-4">Add / Update Semester</h3>
        <div className="mb-4 max-w-[160px]">
          <Input label="Semester Number" type="number" min={1} max={12} value={semesterNumber} onChange={(e) => setSemesterNumber(Number(e.target.value))} />
        </div>
        <div className="space-y-3">
          {subjects.map((s, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1"><Input label={i === 0 ? "Subject" : undefined} value={s.name} onChange={(e) => updateSubject(i, "name", e.target.value)} placeholder="Subject name" /></div>
              <div className="w-24"><Input label={i === 0 ? "Credits" : undefined} type="number" min={1} max={6} value={s.credits} onChange={(e) => updateSubject(i, "credits", e.target.value)} /></div>
              <div className="w-24">
                <Select label={i === 0 ? "Grade" : undefined} value={s.grade} onChange={(e) => updateSubject(i, "grade", e.target.value)}>
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              </div>
              <Button variant="ghost" onClick={() => removeRow(i)}><Trash2 size={18} /></Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={addRow}><Plus size={16} className="inline mr-1" />Add Subject</Button>
          <Button onClick={save}>Save Semester</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {data?.semesters?.map((sem) => (
          <Card key={sem._id}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-textmain">Semester {sem.semesterNumber}</h4>
              <div className="flex items-center gap-3">
                <span className="text-accent font-bold">SGPA {sem.sgpa.toFixed(2)}</span>
                <Button variant="ghost" onClick={() => deleteSem(sem._id)}><Trash2 size={16} /></Button>
              </div>
            </div>
            <div className="text-sm text-textmuted space-y-1">
              {sem.subjects.map((s, i) => <p key={i}>{s.name} — {s.credits} credits — {s.grade}</p>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
