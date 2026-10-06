import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { useAuthStore } from "../../stores/authStore";

interface Entry { _id: string; name: string; xp: number; college?: string; branch?: string; }

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery<{ top: Entry[]; yourRank: number }>({
    queryKey: ["leaderboard"],
    queryFn: async () => (await api.get("/career/leaderboard")).data.data,
    refetchInterval: 20000,
  });

  return (
    <div>
      <PageHeader title="Leaderboard" subtitle={`Your rank: #${data?.yourRank ?? "—"}`} />
      <Card>
        <div className="space-y-1">
          {data?.top.map((e, i) => (
            <div key={e._id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${e._id === user?._id ? "bg-indigo-50" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-textmuted"}`}>
                  {i === 0 ? <Trophy size={14} /> : i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-textmain">{e.name}</p>
                  <p className="text-xs text-textmuted">{e.branch}</p>
                </div>
              </div>
              <span className="font-bold text-accent">{e.xp} XP</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
