import { SafetyLog } from "../models/SafetyLog.js";
import { User } from "../models/User.js";
import { awardXP } from "../services/xpService.js";
import { broadcast } from "../services/socketService.js";
import { Emails } from "../services/emailService.js";

const SAFETY_TIPS = [
  "Share your live location with a trusted contact before walking alone at night.",
  "Stick to well-lit, populated routes even if they take a bit longer.",
  "Keep your phone charged above 20% before heading out at night.",
  "Trust your instincts — if something feels off, head to the nearest safe space.",
];

export async function startWalk(req, res) {
  const { locationDescription, durationMinutes } = req.body;
  if (!durationMinutes) return res.status(400).json({ success: false, error: "durationMinutes required", code: "MISSING_FIELDS" });
  const log = await SafetyLog.create({ userId: req.user.userId, locationDescription, durationMinutes, status: "Active" });
  res.status(201).json({ success: true, data: log, message: "SafeWalk started" });
}

export async function markSafe(req, res) {
  const log = await SafetyLog.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { status: "Safe", endedAt: new Date() },
    { new: true }
  );
  if (!log) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  await awardXP(req.user.userId, 10, "Completed SafeWalk");
  res.json({ success: true, data: log, message: "Marked safe! +10 XP" });
}

export async function triggerSOS(req, res) {
  const log = await SafetyLog.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { status: "SOS", endedAt: new Date() },
    { new: true }
  );
  if (!log) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const user = await User.findById(req.user.userId);
  broadcast("safety:sos", { userId: user._id, name: user.name, location: log.locationDescription });
  if (user.emergencyContact?.name) {
    // In production emergencyContact would include an email/phone; using a placeholder path here
    Emails.sosAlert(process.env.EMAIL_USER, user, log.locationDescription);
  }
  res.json({ success: true, data: log, message: "SOS broadcast sent" });
}

export async function walkHistory(req, res) {
  const items = await SafetyLog.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

export async function safetyTip(req, res) {
  const dayIndex = new Date().getDate() % SAFETY_TIPS.length;
  res.json({ success: true, data: { tip: SAFETY_TIPS[dayIndex] } });
}
