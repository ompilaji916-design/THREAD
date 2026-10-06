import { Notice } from "../models/Notice.js";
import { HostelRequest } from "../models/HostelRequest.js";
import { MarketItem } from "../models/MarketItem.js";
import { awardXP } from "../services/xpService.js";
import { notify } from "../services/notificationService.js";
import { broadcast } from "../services/socketService.js";

// ---- CampusMate Notice Board ----
export async function listNotices(req, res) {
  const items = await Notice.find().populate("userId", "name").sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}
export async function createNotice(req, res) {
  const { title, content, category, priority, isEvent, eventDate } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, error: "title and content required", code: "MISSING_FIELDS" });
  const notice = await Notice.create({ userId: req.user.userId, title, content, category, priority, isEvent, eventDate });
  await awardXP(req.user.userId, 10, "Posted a notice");
  if (priority === "Emergency") {
    broadcast("campus:emergency", { title, content });
  }
  res.status(201).json({ success: true, data: notice, message: "Notice posted! +10 XP" });
}
export async function reactNotice(req, res) {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  notice.reactions.push(req.user.userId);
  await notice.save();
  res.json({ success: true, data: { count: notice.reactions.length } });
}
export async function rsvpNotice(req, res) {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const uid = req.user.userId;
  const idx = notice.rsvps.findIndex((r) => String(r) === String(uid));
  if (idx >= 0) notice.rsvps.splice(idx, 1); else notice.rsvps.push(uid);
  await notice.save();
  res.json({ success: true, data: { count: notice.rsvps.length } });
}

// ---- Hostel HelpDesk ----
const URGENT_KEYWORDS = ["fire", "leak", "spark", "shock", "flood", "gas", "smoke"];
function detectPriority(desc) {
  const lower = (desc || "").toLowerCase();
  if (URGENT_KEYWORDS.some((k) => lower.includes(k))) return "High";
  return "Medium";
}
export async function listHostelRequests(req, res) {
  const items = await HostelRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}
export async function createHostelRequest(req, res) {
  const { type, description, roomNumber } = req.body;
  if (!type || !description || !roomNumber) return res.status(400).json({ success: false, error: "type, description, roomNumber required", code: "MISSING_FIELDS" });
  const priority = detectPriority(description);
  const request = await HostelRequest.create({ userId: req.user.userId, type, description, roomNumber, priority });
  res.status(201).json({ success: true, data: request, message: "Request submitted" });
}
export async function updateHostelRequest(req, res) {
  const request = await HostelRequest.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { new: true });
  if (!request) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  if (req.body.status === "Resolved") {
    await notify(req.user.userId, { type: "hostel_resolved", title: "Request Resolved", message: `Your ${request.type} request has been resolved.` });
  }
  res.json({ success: true, data: request });
}

// ---- Marketplace ----
export async function listMarketItems(req, res) {
  const { category } = req.query;
  const filter = {};
  if (category && category !== "All") filter.category = category;
  const items = await MarketItem.find(filter).populate("userId", "name").sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}
export async function createMarketItem(req, res) {
  const { title, price, category, condition, description } = req.body;
  if (!title || price == null) return res.status(400).json({ success: false, error: "title and price required", code: "MISSING_FIELDS" });
  const item = await MarketItem.create({ userId: req.user.userId, title, price, category, condition, description });
  res.status(201).json({ success: true, data: item, message: "Listed!" });
}
export async function toggleSaveItem(req, res) {
  const item = await MarketItem.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const uid = req.user.userId;
  const idx = item.savedBy.findIndex((u) => String(u) === String(uid));
  if (idx >= 0) item.savedBy.splice(idx, 1); else item.savedBy.push(uid);
  await item.save();
  res.json({ success: true, data: { saved: idx < 0 } });
}
export async function markSold(req, res) {
  const item = await MarketItem.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { isSold: true }, { new: true });
  if (!item) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  await awardXP(req.user.userId, 15, "Sold an item");
  res.json({ success: true, data: item, message: "Marked sold! +15 XP" });
}
