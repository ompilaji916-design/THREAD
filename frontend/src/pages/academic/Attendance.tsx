import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarCheck, Plus } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { CircularProgress } from "../../components/ui/CircularProgress";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";

interface Subject {
  _id: string; name: string; semester: string; totalClasses: number; attendedClasses: number;
  percentage: number | null; safeBunks: number; classesNeeded: number;
}

export default function Attendance() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { data, isLoading } = useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => (await api.get("/attendance/subjects")).data.data,
  });

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post("/attendance/subjects", { name: newName });
      toast.success("Subject added");
      setNewName("");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["subjects"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not add subject");
    }
  };

  const mark = async (subjectId: string, status: "attended" | "bunked" | "cancelled") => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await api.post("/attendance/mark", { subjectId, date: today, status });
      toast.success(`Marked ${status} for today`);
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["attendance-summary"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Already marked for today");
    }
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Track your safe bunks and stay above 75%."
        action={<Button onClick={() => setModalOpen(true)}><Plus size={16} className="inline mr-1" />Add Subject</Button>}
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
      ) : !data?.length ? (
        <EmptyState icon={<CalendarCheck size={48} />} title="No subjects yet" message="Add your first subject to start tracking attendance." ctaLabel="Add Subject" onCta={() => setModalOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((s) => (
            <Card key={s._id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-textmain">{s.name}</h3>
                {s.percentage !== null && (
                  <Badge tone={s.percentage >= 75 ? "success" : "danger"}>{s.percentage >= 75 ? "Safe" : "At Risk"}</Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                <CircularProgress percentage={s.percentage} color={s.percentage !== null && s.percentage < 75 ? "#EF4444" : "#4F46E5"} />
                <div className="text-sm text-textsub space-y-1">
                  <p>{s.attendedClasses}/{s.totalClasses} classes</p>
                  {s.percentage !== null && s.percentage >= 75 ? (
                    <p className="text-success font-medium">{s.safeBunks} safe bunks left</p>
                  ) : s.percentage !== null ? (
                    <p className="text-danger font-medium">Attend next {s.classesNeeded} to recover</p>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1" onClick={() => mark(s._id, "attended")}>Present</Button>
                <Button variant="secondary" className="flex-1" onClick={() => mark(s._id, "bunked")}>Absent</Button>
                <Button variant="ghost" onClick={() => mark(s._id, "cancelled")}>Cancelled</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Subject">
        <form onSubmit={addSubject} className="space-y-4">
          <Input label="Subject Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Data Structures" autoFocus />
          <Button type="submit" className="w-full">Add Subject</Button>
        </form>
      </Modal>
    </div>
  );
}
