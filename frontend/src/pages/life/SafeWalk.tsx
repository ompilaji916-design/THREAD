import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShieldAlert, Siren } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

interface Walk { _id: string; locationDescription: string; durationMinutes: number; status: string; }

export default function SafeWalk() {
  const qc = useQueryClient();
  const [locationDescription, setLocationDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [active, setActive] = useState<Walk | null>(null);

  const { data: tip } = useQuery({ queryKey: ["safety-tip"], queryFn: async () => (await api.get("/life/safewalk/tip")).data.data });
  const { data: history } = useQuery<Walk[]>({ queryKey: ["safewalk-history"], queryFn: async () => (await api.get("/life/safewalk/history")).data.data });

  const start = async () => {
    const res = await api.post("/life/safewalk/start", { locationDescription, durationMinutes });
    setActive(res.data.data);
    toast.success("SafeWalk started");
  };
  const markSafe = async () => {
    if (!active) return;
    await api.patch(`/life/safewalk/${active._id}/safe`);
    toast.success("Marked safe! +10 XP");
    setActive(null);
    qc.invalidateQueries({ queryKey: ["safewalk-history"] });
  };
  const sos = async () => {
    if (!active) return;
    await api.patch(`/life/safewalk/${active._id}/sos`);
    toast.error("SOS sent to your emergency contact!");
    setActive(null);
    qc.invalidateQueries({ queryKey: ["safewalk-history"] });
  };

  return (
    <div>
      <PageHeader title="SafeWalk" subtitle="Let a check-in timer keep you accountable while walking alone." />
      {tip?.tip && (
        <Card className="mb-5 bg-indigo-50/50">
          <p className="text-sm text-textsub flex items-center gap-2"><ShieldAlert size={16} className="text-accent" /> {tip.tip}</p>
        </Card>
      )}
      <Card className="mb-5">
        {!active ? (
          <>
            <Input label="Where are you walking?" value={locationDescription} onChange={(e) => setLocationDescription(e.target.value)} className="mb-3" />
            <Input label="Duration (minutes)" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="mb-3" />
            <Button className="w-full" onClick={start}>Start SafeWalk</Button>
          </>
        ) : (
          <>
            <Badge tone="warning">Active — {active.durationMinutes} min</Badge>
            <p className="text-sm text-textsub mt-2">{active.locationDescription}</p>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={markSafe}>I'm Safe</Button>
              <Button variant="danger" className="flex-1" onClick={sos}><Siren size={16} className="inline mr-1" />SOS</Button>
            </div>
          </>
        )}
      </Card>
      <h3 className="font-bold text-textmain mb-3">History</h3>
      <div className="space-y-2">
        {history?.map((h) => (
          <Card key={h._id} className="!p-3 flex justify-between items-center">
            <p className="text-sm text-textsub">{h.locationDescription || "Unnamed walk"}</p>
            <Badge tone={h.status === "Safe" ? "success" : h.status === "SOS" ? "danger" : "neutral"}>{h.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
