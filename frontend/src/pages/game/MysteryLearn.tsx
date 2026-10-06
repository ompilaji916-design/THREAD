import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Lock, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

interface Level {
  level: number; title: string; story: string; code: string;
  questions: { q: string; options: string[]; answer: number }[];
  progress: { completed: boolean } | null;
}

export default function MysteryLearn() {
  const qc = useQueryClient();
  const { data } = useQuery<Level[]>({ queryKey: ["game-levels"], queryFn: async () => (await api.get("/game/levels")).data.data });
  const [active, setActive] = useState<Level | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const open = (lvl: Level) => { setActive(lvl); setSelected(null); setStartTime(Date.now()); };

  const submit = async () => {
    if (active === null || selected === null) return;
    const correct = selected === active.questions[0].answer;
    if (!correct) { toast.error("Not quite — try again!"); return; }
    try {
      const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);
      const res = await api.post("/game/complete", { level: active.level, correctAnswers: 1, timeTakenSeconds });
      toast.success(res.data.message);
      setActive(null);
      qc.invalidateQueries({ queryKey: ["game-levels"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Already completed"); }
  };

  const isUnlocked = (_lvl: Level, idx: number) => idx === 0 || data?.[idx - 1]?.progress?.completed;

  return (
    <div>
      <PageHeader title="MysteryLearn" subtitle="Debug story-driven code puzzles. 10 levels, escalating XP." />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {data?.map((lvl, idx) => {
          const unlocked = isUnlocked(lvl, idx);
          const done = lvl.progress?.completed;
          return (
            <button
              key={lvl.level}
              disabled={!unlocked}
              onClick={() => open(lvl)}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 ${done ? "bg-emerald-50 border-emerald-300" : unlocked ? "bg-white border-borderc hover:bg-gray-50" : "bg-gray-100 border-gray-200 opacity-60"}`}
            >
              {done ? <CheckCircle2 className="text-success" size={22} /> : unlocked ? <span className="font-bold text-lg">{lvl.level}</span> : <Lock size={18} className="text-textmuted" />}
              <span className="text-xs text-textmuted">Level {lvl.level}</span>
            </button>
          );
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title || ""}>
        {active && (
          <div>
            <p className="text-sm text-textsub mb-3">{active.story}</p>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-4">{active.code}</pre>
            <p className="text-sm font-medium text-textmain mb-2">{active.questions[0].q}</p>
            <div className="space-y-2 mb-4">
              {active.questions[0].options.map((opt, i) => (
                <button key={i} onClick={() => setSelected(i)} className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${selected === i ? "border-accent bg-indigo-50" : "border-borderc"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={submit} disabled={selected === null}>Submit Answer</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
