import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Briefcase } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuthStore } from "../../stores/authStore";

interface Internship { _id: string; company: string; role: string; description: string; deadline: string; requiredSkills: string[]; applicants: string[]; }

export default function Internships() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery<Internship[]>({ queryKey: ["internships"], queryFn: async () => (await api.get("/career/internships")).data.data });

  const apply = async (id: string) => {
    try {
      await api.post(`/career/internships/${id}/apply`);
      toast.success("Applied! +10 XP");
      qc.invalidateQueries({ queryKey: ["internships"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Could not apply"); }
  };

  return (
    <div>
      <PageHeader title="Internships" subtitle="Peer-shared internship and job opportunities." />
      {!data?.length ? (
        <EmptyState icon={<Briefcase size={48} />} title="No listings yet" message="Check back soon for opportunities." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {data.map((i) => {
            const applied = i.applicants.some((a) => a === user?._id);
            return (
              <Card key={i._id}>
                <h4 className="font-bold text-textmain">{i.role}</h4>
                <p className="text-sm text-textsub">{i.company}</p>
                <p className="text-sm text-textmuted mt-2">{i.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">{i.requiredSkills.map((s) => <Badge key={s} tone="accent">{s}</Badge>)}</div>
                <p className="text-xs text-textmuted mt-2">Deadline: {new Date(i.deadline).toLocaleDateString()}</p>
                <Button className="w-full mt-3" disabled={applied} onClick={() => apply(i._id)}>{applied ? "Applied" : "Apply (+10 XP)"}</Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
