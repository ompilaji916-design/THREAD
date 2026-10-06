import { Complaint } from "../models/Complaint.js";
import { notify } from "../services/notificationService.js";

export async function listComplaints(req, res) {
  const items = await Complaint.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}
export async function createComplaint(req, res) {
  const { category, description, location, photo, isAnonymous } = req.body;
  if (!category || !description) return res.status(400).json({ success: false, error: "category and description required", code: "MISSING_FIELDS" });
  const slaDeadline = new Date(Date.now() + 72 * 3600 * 1000); // 72h SLA
  const complaint = await Complaint.create({ userId: req.user.userId, category, description, location, photo, isAnonymous, slaDeadline });
  res.status(201).json({ success: true, data: complaint, message: "Complaint submitted" });
}
export async function updateComplaintStatus(req, res) {
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!complaint) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  await notify(complaint.userId, { type: "complaint_update", title: "Complaint Status Updated", message: `Your complaint is now: ${req.body.status}` });
  res.json({ success: true, data: complaint });
}
export async function upvoteComplaint(req, res) {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const uid = req.user.userId;
  const idx = complaint.upvotes.findIndex((u) => String(u) === String(uid));
  if (idx >= 0) complaint.upvotes.splice(idx, 1); else complaint.upvotes.push(uid);
  await complaint.save();
  res.json({ success: true, data: { count: complaint.upvotes.length } });
}
export async function commentComplaint(req, res) {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  complaint.comments.push({ userId: req.user.userId, text: req.body.text });
  await complaint.save();
  res.json({ success: true, data: complaint });
}
