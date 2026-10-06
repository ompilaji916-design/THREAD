import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2, Flame, Play, Pause, RotateCcw, Target, CheckCircle2, Circle } from "lucide-react";
import { api } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { CircularProgress } from "../../components/ui/CircularProgress";

type Tab = "habits" | "focus" | "goals";

const EMOJIS = ["✅", "📚", "💧", "🏃", "🧘", "🛌", "🥗", "💻", "🙏", "📝"];
const FOCUS_PRESETS = [15, 25, 45, 60];

export default function Productivity() {
  const [tab, setTab] = useState<Tab>("habits");

  return (
    <div>
      <PageHeader
        title="Productivity Hub"
        subtitle="Habits, focus sessions, and goals — all in one place."
      />

      <div className="flex gap-2 mb-6 border-b border-borderc">
        {([
          { key: "habits", label: "Habit Tracker" },
          { key: "focus", label: "Focus Timer" },
          { key: "goals", label: "Goal Tracker" },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`min-h-[44px] px-4 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.key ? "border-accent text-accent" : "border-transparent text-textmuted hover:text-textmain"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "habits" && <HabitTracker />}
      {tab === "focus" && <FocusTimer />}
      {tab === "goals" && <GoalTracker />}
    </div>
  );
}

/* ============================== Habit Tracker ============================== */

function HabitTracker() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("✅");

  const { data: habits, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => (await api.get("/productivity/habits")).data.data,
  });

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Give your habit a name");
    try {
      await api.post("/productivity/habits", { title, emoji });
      toast.success("Habit added");
      setModalOpen(false);
      setTitle("");
      setEmoji("✅");
      qc.invalidateQueries({ queryKey: ["habits"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not add habit");
    }
  };

  const toggleHabit = async (id: string) => {
    try {
      const res = await api.patch(`/productivity/habits/${id}/toggle`);
      if (res.data.message) toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["habits"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not update habit");
    }
  };

  const removeHabit = async (id: string) => {
    await api.delete(`/productivity/habits/${id}`);
    qc.invalidateQueries({ queryKey: ["habits"] });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="inline mr-1" /> New Habit
        </Button>
      </div>

      {isLoading && <p className="text-sm text-textmuted">Loading habits...</p>}
      {!isLoading && !habits?.length && (
        <Card className="text-center py-10">
          <p className="text-textmuted text-sm">No habits yet. Start with something small — water, sleep, or a walk.</p>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits?.map((h: any) => (
          <Card key={h._id} className="!p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{h.emoji}</span>
                <div>
                  <p className="font-bold text-textmain leading-tight">{h.title}</p>
                  <p className="text-xs text-textmuted flex items-center gap-1 mt-0.5">
                    <Flame size={12} className="text-warning" /> {h.streak}-day streak · best {h.longestStreak}
                  </p>
                </div>
              </div>
              <button onClick={() => removeHabit(h._id)} className="text-textmuted hover:text-danger min-h-[32px] min-w-[32px] flex items-center justify-center">
                <Trash2 size={15} />
              </button>
            </div>
            <button
              onClick={() => toggleHabit(h._id)}
              className={`w-full min-h-[44px] rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                h.doneToday ? "bg-accent text-white" : "bg-surfaceAlt text-textsub border border-borderc hover:border-accent"
              }`}
            >
              {h.doneToday ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              {h.doneToday ? "Done today" : "Mark done"}
            </button>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Habit">
        <form onSubmit={addHabit} className="space-y-3">
          <Input label="Habit name" placeholder="e.g. Drink 3L water" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-textsub mb-1">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg border text-lg flex items-center justify-center ${
                    emoji === e ? "border-accent bg-accent/10" : "border-borderc"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">Add Habit</Button>
        </form>
      </Modal>
    </div>
  );
}

/* ============================== Focus Timer ============================== */

function FocusTimer() {
  const qc = useQueryClient();
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["focus-stats"],
    queryFn: async () => (await api.get("/productivity/focus/stats")).data.data,
  });

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            finishSession();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const finishSession = async () => {
    try {
      const res = await api.post("/productivity/focus/sessions", { durationMinutes: minutes, task: task || "Focus session" });
      toast.success(res.data.message || "Session logged!");
      qc.invalidateQueries({ queryKey: ["focus-stats"] });
    } catch {
      toast.error("Could not log session");
    }
  };

  const selectPreset = (m: number) => {
    setRunning(false);
    setMinutes(m);
    setSecondsLeft(m * 60);
  };

  const toggleRunning = () => setRunning((r) => !r);
  const reset = () => { setRunning(false); setSecondsLeft(minutes * 60); };

  const pct = ((minutes * 60 - secondsLeft) / (minutes * 60)) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Card className="flex flex-col items-center py-8">
        <div className="relative mb-5">
          <CircularProgress percentage={pct} size={180} color="#006C49" />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-3xl font-extrabold text-textmain">{mm}:{ss}</p>
          </div>
        </div>

        <Input
          placeholder="What are you focusing on?"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="mb-4 max-w-xs"
        />

        <div className="flex gap-2 mb-5">
          {FOCUS_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => selectPreset(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                minutes === m ? "bg-accent text-white border-accent" : "border-borderc text-textsub hover:border-accent"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={toggleRunning} className="!px-6">
            {running ? <Pause size={16} className="inline mr-1" /> : <Play size={16} className="inline mr-1" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="secondary" onClick={reset}><RotateCcw size={16} /></Button>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="!p-4 text-center">
            <p className="text-2xl font-extrabold text-accent">{stats?.todayMinutes ?? 0}m</p>
            <p className="text-xs text-textmuted">Focused today</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-2xl font-extrabold text-accent">{stats?.weekMinutes ?? 0}m</p>
            <p className="text-xs text-textmuted">This week</p>
          </Card>
        </div>
        <Card>
          <h3 className="font-bold text-textmain mb-3">Recent Sessions</h3>
          {stats?.recent?.length ? (
            <div className="space-y-2">
              {stats.recent.map((s: any) => (
                <div key={s._id} className="flex justify-between text-sm border-b border-borderc pb-2 last:border-0">
                  <span className="text-textsub">{s.task}</span>
                  <span className="font-semibold text-textmain">{s.durationMinutes}m</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-textmuted">No sessions logged yet. Start your first timer!</p>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================== Goal Tracker ============================== */

function GoalTracker() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesText, setMilestonesText] = useState("");

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => (await api.get("/productivity/goals")).data.data,
  });

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Give your goal a name");
    const milestones = milestonesText.split("\n").map((m) => m.trim()).filter(Boolean);
    try {
      await api.post("/productivity/goals", { title, targetDate: targetDate || null, milestones });
      toast.success("Goal created");
      setModalOpen(false);
      setTitle(""); setTargetDate(""); setMilestonesText("");
      qc.invalidateQueries({ queryKey: ["goals"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not create goal");
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const res = await api.patch(`/productivity/goals/${goalId}/milestones/${milestoneId}/toggle`);
    if (res.data.data.status === "completed") toast.success("Goal completed! +20 XP 🎉");
    qc.invalidateQueries({ queryKey: ["goals"] });
  };

  const removeGoal = async (id: string) => {
    await api.delete(`/productivity/goals/${id}`);
    qc.invalidateQueries({ queryKey: ["goals"] });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} className="inline mr-1" /> New Goal
        </Button>
      </div>

      {isLoading && <p className="text-sm text-textmuted">Loading goals...</p>}
      {!isLoading && !goals?.length && (
        <Card className="text-center py-10">
          <p className="text-textmuted text-sm">No goals yet. Break something big into small milestones.</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {goals?.map((g: any) => (
          <Card key={g._id}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-accent" />
                <p className="font-bold text-textmain">{g.title}</p>
              </div>
              <button onClick={() => removeGoal(g._id)} className="text-textmuted hover:text-danger min-h-[32px] min-w-[32px] flex items-center justify-center">
                <Trash2 size={15} />
              </button>
            </div>
            {g.targetDate && <p className="text-xs text-textmuted mb-2">Target: {g.targetDate}</p>}

            <div className="w-full h-2 bg-surfaceAlt rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${g.progress}%` }} />
            </div>

            <div className="space-y-1.5">
              {g.milestones.map((m: any) => (
                <button
                  key={m._id}
                  onClick={() => toggleMilestone(g._id, m._id)}
                  className="w-full flex items-center gap-2 text-sm text-left min-h-[36px]"
                >
                  {m.done ? <CheckCircle2 size={16} className="text-accent shrink-0" /> : <Circle size={16} className="text-textmuted shrink-0" />}
                  <span className={m.done ? "line-through text-textmuted" : "text-textsub"}>{m.title}</span>
                </button>
              ))}
            </div>

            {g.status === "completed" && (
              <p className="text-xs font-semibold text-accent mt-2">🎉 Completed!</p>
            )}
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Goal">
        <form onSubmit={addGoal} className="space-y-3">
          <Input label="Goal" placeholder="e.g. Finish DSA roadmap" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Target date (optional)" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-textsub mb-1">Milestones (one per line)</label>
            <textarea
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-borderc bg-white text-textmain focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder={"Arrays & Strings\nLinked Lists\nTrees & Graphs"}
              value={milestonesText}
              onChange={(e) => setMilestonesText(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Create Goal</Button>
        </form>
      </Modal>
    </div>
  );
}
