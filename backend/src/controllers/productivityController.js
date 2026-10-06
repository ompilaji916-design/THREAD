import { Habit } from "../models/Habit.js";
import { Goal } from "../models/Goal.js";
import { FocusSession } from "../models/FocusSession.js";
import { awardXP, checkStreakMilestone } from "../services/xpService.js";

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

/* ---------------- Habits ---------------- */

export async function listHabits(req, res) {
  const habits = await Habit.find({ userId: req.user.userId, archived: false }).sort({ createdAt: -1 });
  const today = todayStr();
  const data = habits.map((h) => ({ ...h.toObject(), doneToday: h.completions.includes(today) }));
  res.json({ success: true, data });
}

export async function createHabit(req, res) {
  const { title, emoji, color } = req.body;
  if (!title) return res.status(400).json({ success: false, error: "title required", code: "MISSING_FIELDS" });
  const habit = await Habit.create({ userId: req.user.userId, title, emoji, color });
  res.status(201).json({ success: true, data: habit });
}

export async function toggleHabitToday(req, res) {
  const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!habit) return res.status(404).json({ success: false, error: "Habit not found", code: "NOT_FOUND" });

  const today = todayStr();
  const alreadyDone = habit.completions.includes(today);

  if (alreadyDone) {
    habit.completions = habit.completions.filter((d) => d !== today);
  } else {
    habit.completions.push(today);
    await awardXP(req.user.userId, 3, `Habit checked in: ${habit.title}`);
  }

  // Recalculate current streak by walking backwards from today
  let streak = 0;
  for (let i = 0; ; i++) {
    if (habit.completions.includes(daysAgoStr(i))) streak++;
    else break;
  }
  habit.streak = streak;
  habit.longestStreak = Math.max(habit.longestStreak, streak);
  await habit.save();

  if (!alreadyDone) await checkStreakMilestone(req.user.userId, streak);

  res.json({ success: true, data: { ...habit.toObject(), doneToday: !alreadyDone } });
}

export async function deleteHabit(req, res) {
  await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { archived: true });
  res.json({ success: true, data: null });
}

/* ---------------- Goals ---------------- */

export async function listGoals(req, res) {
  const goals = await Goal.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  const data = goals.map((g) => {
    const total = g.milestones.length;
    const done = g.milestones.filter((m) => m.done).length;
    return { ...g.toObject(), progress: total ? Math.round((done / total) * 100) : 0 };
  });
  res.json({ success: true, data });
}

export async function createGoal(req, res) {
  const { title, description, targetDate, milestones } = req.body;
  if (!title) return res.status(400).json({ success: false, error: "title required", code: "MISSING_FIELDS" });
  const goal = await Goal.create({
    userId: req.user.userId,
    title,
    description,
    targetDate: targetDate || null,
    milestones: (milestones || []).map((m) => ({ title: m, done: false })),
  });
  res.status(201).json({ success: true, data: goal });
}

export async function toggleMilestone(req, res) {
  const { id, milestoneId } = req.params;
  const goal = await Goal.findOne({ _id: id, userId: req.user.userId });
  if (!goal) return res.status(404).json({ success: false, error: "Goal not found", code: "NOT_FOUND" });

  const milestone = goal.milestones.id(milestoneId);
  if (!milestone) return res.status(404).json({ success: false, error: "Milestone not found", code: "NOT_FOUND" });

  milestone.done = !milestone.done;

  const allDone = goal.milestones.length > 0 && goal.milestones.every((m) => m.done);
  if (allDone && goal.status === "active") {
    goal.status = "completed";
    await awardXP(req.user.userId, 20, `Goal completed: ${goal.title}`);
  } else if (!allDone && goal.status === "completed") {
    goal.status = "active";
  }

  await goal.save();
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.done).length;
  res.json({ success: true, data: { ...goal.toObject(), progress: total ? Math.round((done / total) * 100) : 0 } });
}

export async function deleteGoal(req, res) {
  await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true, data: null });
}

/* ---------------- Focus Timer (Pomodoro) ---------------- */

export async function logFocusSession(req, res) {
  const { durationMinutes, task } = req.body;
  if (!durationMinutes || durationMinutes <= 0) {
    return res.status(400).json({ success: false, error: "durationMinutes required", code: "MISSING_FIELDS" });
  }
  const session = await FocusSession.create({
    userId: req.user.userId,
    date: todayStr(),
    task: task || "Focus session",
    durationMinutes,
  });
  // 1 XP per 5 focused minutes, so a 25-min pomodoro earns 5 XP
  const xp = Math.max(1, Math.round(durationMinutes / 5));
  await awardXP(req.user.userId, xp, `Focus session: ${session.task}`);
  res.status(201).json({ success: true, data: session, message: `+${xp} XP for staying focused` });
}

export async function focusStats(req, res) {
  const today = todayStr();
  const weekAgo = daysAgoStr(6);
  const sessions = await FocusSession.find({ userId: req.user.userId, date: { $gte: weekAgo } }).sort({ date: 1 });

  const todayMinutes = sessions.filter((s) => s.date === today).reduce((sum, s) => sum + s.durationMinutes, 0);
  const weekMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const byDay = {};
  sessions.forEach((s) => { byDay[s.date] = (byDay[s.date] || 0) + s.durationMinutes; });

  res.json({
    success: true,
    data: { todayMinutes, weekMinutes, sessionsToday: sessions.filter((s) => s.date === today).length, byDay, recent: sessions.slice(-10).reverse() },
  });
}
