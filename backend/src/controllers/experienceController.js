import { Experience } from "../models/Experience.js";
import { User } from "../models/User.js";
import { awardXP } from "../services/xpService.js";
import { notify } from "../services/notificationService.js";

export async function listExperiences(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const { language, difficulty, search } = req.query;
  const filter = {};
  if (language) filter.language = language;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.$text = { $search: search };

  const items = await Experience.find(filter)
    .populate("userId", "name college branch year")
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

  res.json({ success: true, data: items, page });
}

export async function trending(req, res) {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const items = await Experience.find({ createdAt: { $gte: weekAgo } })
    .populate("userId", "name college branch year");
  const sorted = items.sort((a, b) => b.upvotes.length - a.upvotes.length).slice(0, 3);
  res.json({ success: true, data: sorted });
}

export async function createExperience(req, res) {
  const { title, language, difficulty, content, mistakesMade, resourcesUsed, timeTaken } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, error: "Title and content are required", code: "MISSING_FIELDS" });
  const exp = await Experience.create({ userId: req.user.userId, title, language, difficulty, content, mistakesMade, resourcesUsed, timeTaken });
  await awardXP(req.user.userId, 20, "Published a learning post");
  res.status(201).json({ success: true, data: exp, message: "Published! +20 XP" });
}

export async function toggleUpvote(req, res) {
  const exp = await Experience.findById(req.params.id);
  if (!exp) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const uid = req.user.userId;
  const idx = exp.upvotes.findIndex((u) => String(u) === String(uid));
  let added = false;
  if (idx >= 0) exp.upvotes.splice(idx, 1);
  else { exp.upvotes.push(uid); added = true; }
  await exp.save();
  if (added && String(exp.userId) !== String(uid)) {
    await awardXP(exp.userId, 5, "Received an upvote");
    await notify(exp.userId, { type: "upvote", title: "Your post got an upvote!", message: `"${exp.title}" received an upvote.` });
  }
  res.json({ success: true, data: { upvoted: added, count: exp.upvotes.length } });
}

export async function toggleBookmark(req, res) {
  const exp = await Experience.findById(req.params.id);
  if (!exp) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const uid = req.user.userId;
  const idx = exp.bookmarkedBy.findIndex((u) => String(u) === String(uid));
  let added = false;
  if (idx >= 0) exp.bookmarkedBy.splice(idx, 1);
  else { exp.bookmarkedBy.push(uid); added = true; }
  await exp.save();
  res.json({ success: true, data: { bookmarked: added } });
}

export async function myBookmarks(req, res) {
  const items = await Experience.find({ bookmarkedBy: req.user.userId }).populate("userId", "name college branch year");
  res.json({ success: true, data: items });
}
