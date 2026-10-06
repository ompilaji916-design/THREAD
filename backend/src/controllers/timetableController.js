import { ClassSlot } from "../models/ClassSlot.js";

function toMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

export async function listSlots(req, res) {
  const slots = await ClassSlot.find({ userId: req.user.userId }).sort({ day: 1, startTime: 1 });
  res.json({ success: true, data: slots });
}

export async function createSlot(req, res) {
  const { day, startTime, endTime, subject, type, room } = req.body;
  if (!day || !startTime || !endTime || !subject) {
    return res.status(400).json({ success: false, error: "day, startTime, endTime, subject required", code: "MISSING_FIELDS" });
  }
  const existing = await ClassSlot.find({ userId: req.user.userId, day });
  const conflict = existing.some((s) => toMinutes(startTime) < toMinutes(s.endTime) && toMinutes(endTime) > toMinutes(s.startTime));
  const slot = await ClassSlot.create({ userId: req.user.userId, day, startTime, endTime, subject, type, room });
  res.status(201).json({ success: true, data: slot, message: conflict ? "Added, but this overlaps another class" : "Class added" });
}

export async function updateSlot(req, res) {
  const slot = await ClassSlot.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { new: true });
  if (!slot) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  res.json({ success: true, data: slot, message: "Updated" });
}

export async function deleteSlot(req, res) {
  await ClassSlot.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true, message: "Deleted" });
}
