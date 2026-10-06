import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface Challenge { dayKey: string; title: string; difficulty: string; prompt: string; hints: string[]; attempt: any; }

export default function DailyChallenge() {
  const qc = useQueryClient();
  const [hintsShown, setHintsShown] = useState(0);
  const [solution, setSolution] = useState<string | null>(null);

  const { data } = useQuery<Challenge>({ queryKey: ["daily-challenge"], queryFn: async () => (await api.get("/career/daily-challenge/today")).data.data });

  const useHint = async () => {
    if (!data) return;
    await api.post("/career/daily-challenge/hint", { dayKey: data.dayKey });
    setHintsShown((h) => Math.min(2, h + 1));
  };
  const submit = async () => {
    if (!data) return;
    try {
      const res = await api.post("/career/daily-challenge/submit", { dayKey: data.dayKey });
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["daily-challenge"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Already solved today"); }
  };
  const reveal = async () => {
    if (!data) return;
    const res = await api.post("/career/daily-challenge/reveal", { dayKey: data.dayKey });
    setSolution(res.data.data.solution);
  };

  const solved = data?.attempt?.status === "solved";

  return (
    <div>
      <PageHeader title="Daily Coding Challenge" subtitle="One new C challenge every day. Solve it for XP." />
      {data && (
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-textmain">{data.title}</h4>
            <Badge tone="accent">{data.difficulty}</Badge>
            {solved && <Badge tone="success">Solved</Badge>}
          </div>
          <p className="text-sm text-textsub mb-4">{data.prompt}</p>
          {Array.from({ length: hintsShown }).map((_, i) => (
            <p key={i} className="text-sm text-textmuted bg-gray-50 p-2 rounded-lg mb-2">💡 {data.hints[i]}</p>
          ))}
          {solution && <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3">{solution}</pre>}
          <div className="flex gap-2 flex-wrap">
            {hintsShown < 2 && <Button variant="secondary" onClick={useHint}>Use Hint ({hintsShown}/2)</Button>}
            {!solution && <Button variant="ghost" onClick={reveal}>Reveal Solution</Button>}
            {!solved && <Button onClick={submit}>Mark as Solved</Button>}
          </div>
        </Card>
      )}
    </div>
  );
}
