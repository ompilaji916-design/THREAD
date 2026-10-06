import { MoodLog } from "../models/MoodLog.js";
import { awardXP } from "../services/xpService.js";

const MOTIVATION = {
  1: "Rough day. Tomorrow is a fresh start — be gentle with yourself.",
  2: "It's okay to have low days. Small steps count too.",
  3: "A steady day. Keep the momentum going.",
  4: "Good energy today! Keep doing what's working.",
  5: "Amazing! Bottle this feeling for the harder days.",
};

export async function logMood(req, res) {
  const { date, level, note, tags, energy, sleepHours } = req.body;
  if (!date || !level) return res.status(400).json({ success: false, error: "date and level required", code: "MISSING_FIELDS" });
  const existing = await MoodLog.findOne({ userId: req.user.userId, date });
  if (existing) return res.status(409).json({ success: false, error: "Already logged mood for today", code: "ALREADY_LOGGED" });
  const log = await MoodLog.create({ userId: req.user.userId, date, level, note, tags, energy, sleepHours });
  await awardXP(req.user.userId, 5, "Logged mood");
  res.status(201).json({ success: true, data: log, message: MOTIVATION[level] });
}

export async function moodTrend(req, res) {
  const logs = await MoodLog.find({ userId: req.user.userId }).sort({ date: -1 }).limit(30);
  const chrono = [...logs].reverse();
  const avg = logs.length ? logs.reduce((s, l) => s + l.level, 0) / logs.length : 0;
  const tagCounts = {};
  logs.forEach((l) => l.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const mostCommonTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  res.json({ success: true, data: { logs: chrono, averageLevel: avg, mostCommonTag } });
}
