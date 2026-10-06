import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarCheck, ListTodo, Calculator, Flame, Trophy, Sparkles } from "lucide-react";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/layout/StatCard";
import { Card } from "../../components/ui/Card";
import { CardSkeleton } from "../../components/ui/Skeleton";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const attendance = useQuery({
    queryKey: ["attendance-summary"],
    queryFn: async () => (await api.get("/attendance/summary")).data.data,
  });
  const assignments = useQuery({
    queryKey: ["assignments", "All", "false"],
    queryFn: async () => (await api.get("/assignments?archived=false")).data.data,
  });
  const cgpa = useQuery({
    queryKey: ["cgpa"],
    queryFn: async () => (await api.get("/cgpa")).data.data,
  });
  const challenge = useQuery({
    queryKey: ["daily-challenge"],
    queryFn: async () => (await api.get("/career/daily-challenge/today")).data.data,
  });

  const loading = attendance.isLoading || assignments.isLoading || cgpa.isLoading;

  return (
    <div>
      <PageHeader title={`Hey, ${user?.name?.split(" ")[0] || "there"} 👋`} subtitle="Here's what's happening across your THREAD today." />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={CalendarCheck} label="Attendance" value={attendance.data?.overallPercentage ? `${attendance.data.overallPercentage.toFixed(1)}%` : "—"} />
          <StatCard icon={ListTodo} label="Open Assignments" value={assignments.data?.stats?.total ?? 0} trend={assignments.data?.stats?.overdue ? `${assignments.data.stats.overdue} overdue` : undefined} />
          <StatCard icon={Calculator} label="CGPA" value={cgpa.data?.cgpa ? cgpa.data.cgpa.toFixed(2) : "—"} />
          <StatCard icon={Flame} label="Login Streak" value={`${user?.loginStreak || 0} days`} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-accent" />
            <h3 className="font-bold text-textmain">Today's Coding Challenge</h3>
          </div>
          {challenge.data ? (
            <>
              <p className="text-sm text-textsub font-medium">{challenge.data.title} · {challenge.data.difficulty}</p>
              <p className="text-sm text-textmuted mt-1 line-clamp-2">{challenge.data.prompt}</p>
              <Link to="/app/daily-challenge" className="text-accent text-sm font-semibold mt-3 inline-block">Solve it →</Link>
            </>
          ) : (
            <p className="text-sm text-textmuted">Loading today's challenge...</p>
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-accent" />
            <h3 className="font-bold text-textmain">Your XP</h3>
          </div>
          <p className="text-3xl font-extrabold text-textmain">{user?.xp ?? 0} XP</p>
          <p className="text-textmuted text-sm mt-1">{user?.badges?.length || 0} badges earned</p>
          <Link to="/app/leaderboard" className="text-accent text-sm font-semibold mt-3 inline-block">View Leaderboard →</Link>
        </Card>
      </div>
    </div>
  );
}
