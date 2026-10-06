import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Users } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuthStore } from "../../stores/authStore";

interface Profile { _id: string; userId: { _id: string; name: string }; skillsToTeach: string[]; skillsToLearn: string[]; credits: number; }

export default function SkillExchange() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data: mine } = useQuery<Profile>({ queryKey: ["skill-exchange-me"], queryFn: async () => (await api.get("/campus/skill-exchange/me")).data.data });
  const { data: all } = useQuery<Profile[]>({ queryKey: ["skill-exchange"], queryFn: async () => (await api.get("/campus/skill-exchange")).data.data });

  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");

  useEffect(() => {
    if (mine) { setTeach(mine.skillsToTeach?.join(", ") || ""); setLearn(mine.skillsToLearn?.join(", ") || ""); }
  }, [mine]);

  const save = async () => {
    await api.put("/campus/skill-exchange/me", {
      skillsToTeach: teach.split(",").map((s) => s.trim()).filter(Boolean),
      skillsToLearn: learn.split(",").map((s) => s.trim()).filter(Boolean),
    });
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["skill-exchange-me"] });
    qc.invalidateQueries({ queryKey: ["skill-exchange"] });
  };

  return (
    <div>
      <PageHeader title="Skill Exchange" subtitle="Teach a skill, learn a skill, earn credits." />
      <Card className="mb-5">
        <p className="text-sm text-textmuted mb-3">Your credits: <span className="font-bold text-accent">{mine?.credits ?? 5}</span></p>
        <Input label="Skills you can teach (comma-separated)" value={teach} onChange={(e) => setTeach(e.target.value)} className="mb-3" />
        <Input label="Skills you want to learn (comma-separated)" value={learn} onChange={(e) => setLearn(e.target.value)} />
        <Button className="mt-3" onClick={save}>Save Profile</Button>
      </Card>
      <h3 className="font-bold text-textmain mb-3">Browse Peers</h3>
      {!all?.filter((p) => p.userId?._id !== user?._id).length ? (
        <EmptyState icon={<Users size={40} />} title="No peers yet" message="Others will appear here once they set up their profile." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {all.filter((p) => p.userId?._id !== user?._id).map((p) => (
            <Card key={p._id}>
              <h4 className="font-bold text-textmain">{p.userId?.name}</h4>
              <div className="flex flex-wrap gap-1 mt-2">{p.skillsToTeach.map((s) => <Badge key={s} tone="accent">{s}</Badge>)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
