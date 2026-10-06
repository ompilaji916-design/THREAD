import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";

const MOODS = [
  { level: 1, emoji: "😞", label: "Terrible" },
  { level: 2, emoji: "😕", label: "Low" },
  { level: 3, emoji: "😐", label: "Okay" },
  { level: 4, emoji: "🙂", label: "Good" },
  { level: 5, emoji: "😄", label: "Amazing" },
];

export default function Mood() {
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data } = useQuery<{ logs: any[]; averageLevel: number }>({ queryKey: ["mood-trend"], queryFn: async () => (await api.get("/life/mood/trend")).data.data });

  const logMood = async (level: number) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await api.post("/life/mood", { date: today, level, note, tags: [], energy: 5, sleepHours: 7 });
      toast.success(res.data.message);
      setNote("");
      qc.invalidateQueries({ queryKey: ["mood-trend"] });
    } catch (err: any) { toast.error(err?.response?.data?.error || "Already logged today"); }
  };

  const chartData = data?.logs?.map((l) => ({ date: l.date.slice(5), level: l.level })) || [];

  return (
    <div>
      <PageHeader title="Mood Tracker" subtitle="One log a day. Small check-ins add up." />
      <Card className="mb-5">
        <p className="text-sm font-medium text-textsub mb-3">How are you feeling today?</p>
        <div className="flex justify-between gap-2 mb-3">
          {MOODS.map((m) => (
            <button key={m.level} onClick={() => logMood(m.level)} className="flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border border-borderc hover:bg-gray-50 min-h-[64px]">
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-textmuted">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-borderc" placeholder="Optional note..." value={note} onChange={(e) => setNote(e.target.value)} />
      </Card>
      <Card>
        <h3 className="font-bold text-textmain mb-3">30-Day Trend {data?.averageLevel ? `(avg ${data.averageLevel.toFixed(1)})` : ""}</h3>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" fontSize={11} />
              <YAxis domain={[1, 5]} fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="level" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-textmuted">Log your mood to see trends.</p>}
      </Card>
    </div>
  );
}
