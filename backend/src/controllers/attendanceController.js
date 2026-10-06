import { Subject } from "../models/Subject.js";
import { AttendanceLog } from "../models/AttendanceLog.js";
import { notify } from "../services/notificationService.js";
import { Emails } from "../services/emailService.js";
import { User } from "../models/User.js";

function pct(attended, total) {
  return total === 0 ? null : (attended / total) * 100;
}

export async function listSubjects(req, res) {
  const subjects = await Subject.find({ userId: req.user.userId }).sort({ createdAt: 1 });
  const withStats = subjects.map((s) => {
    const p = pct(s.attendedClasses, s.totalClasses);
    const safeBunks = p === null ? 0 : Math.max(0, Math.floor((s.attendedClasses - 0.75 * s.totalClasses) / 0.25));
    const needed = p === null || p >= 75 ? 0 : Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25);
    return { ...s.toObject(), percentage: p, safeBunks, classesNeeded: needed };
  });
  res.json({ success: true, data: withStats });
}

export async function createSubject(req, res) {
  try {
    const { name, semester, color } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Subject name is required", code: "MISSING_FIELDS" });
    const subject = await Subject.create({ userId: req.user.userId, name, semester, color });
    res.status(201).json({ success: true, data: subject, message: "Subject added" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, error: "Subject already exists", code: "DUPLICATE" });
    console.error("Attendance error:", err.message);
    res.status(500).json({ success: false, error: "Could not create subject", code: "SERVER_ERROR" });
  }
}

export async function updateSubject(req, res) {
  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { $set: req.body },
    { new: true }
  );
  if (!subject) return res.status(404).json({ success: false, error: "Subject not found", code: "NOT_FOUND" });
  res.json({ success: true, data: subject, message: "Subject updated" });
}

export async function deleteSubject(req, res) {
  await Subject.deleteOne({ _id: req.params.id, userId: req.user.userId });
  await AttendanceLog.deleteMany({ subjectId: req.params.id, userId: req.user.userId });
  res.json({ success: true, message: "Subject deleted" });
}

export async function markAttendance(req, res) {
  const { subjectId, date, status } = req.body;
  if (!subjectId || !date || !status) {
    return res.status(400).json({ success: false, error: "subjectId, date, and status are required", code: "MISSING_FIELDS" });
  }
  const existing = await AttendanceLog.findOne({ userId: req.user.userId, subjectId, date });
  if (existing) {
    return res.status(409).json({ success: false, error: "Attendance already marked for this date", code: "ALREADY_MARKED" });
  }
  await AttendanceLog.create({ userId: req.user.userId, subjectId, date, status });

  const subject = await Subject.findOne({ _id: subjectId, userId: req.user.userId });
  if (!subject) return res.status(404).json({ success: false, error: "Subject not found", code: "NOT_FOUND" });

  if (status === "attended") { subject.attendedClasses += 1; subject.totalClasses += 1; }
  else if (status === "bunked") { subject.totalClasses += 1; }
  // cancelled: log only, does not affect totals

  const newPct = pct(subject.attendedClasses, subject.totalClasses);
  if (newPct !== null && newPct < 75) {
    const today = new Date().toISOString().slice(0, 10);
    const alreadyEmailedToday = subject.lastWarningEmailDate &&
      new Date(subject.lastWarningEmailDate).toISOString().slice(0, 10) === today;
    if (!alreadyEmailedToday) {
      const user = await User.findById(req.user.userId);
      await notify(req.user.userId, {
        type: "attendance_warning",
        title: `${subject.name} below 75%`,
        message: `Your attendance in ${subject.name} is now ${newPct.toFixed(1)}%.`,
        priority: "high",
      });
      Emails.attendanceWarning(user, subject);
      subject.lastWarningEmailDate = new Date();
    }
  }

  await subject.save();
  res.json({ success: true, data: subject, message: "Attendance marked" });
}

export async function getSummary(req, res) {
  const subjects = await Subject.find({ userId: req.user.userId });
  const totalAttended = subjects.reduce((s, x) => s + x.attendedClasses, 0);
  const totalClasses = subjects.reduce((s, x) => s + x.totalClasses, 0);
  const overall = pct(totalAttended, totalClasses);
  const sorted = [...subjects].sort((a, b) => pct(b.attendedClasses, b.totalClasses) - pct(a.attendedClasses, a.totalClasses));
  res.json({ success: true, data: { overallPercentage: overall, subjects: sorted } });
}
