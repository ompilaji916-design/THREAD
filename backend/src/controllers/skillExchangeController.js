import { SkillExchange } from "../models/SkillExchange.js";
import { User } from "../models/User.js";

export async function listProfiles(req, res) {
  const items = await SkillExchange.find().populate("userId", "name college branch year");
  res.json({ success: true, data: items });
}
export async function getMyProfile(req, res) {
  let profile = await SkillExchange.findOne({ userId: req.user.userId });
  if (!profile) profile = await SkillExchange.create({ userId: req.user.userId });
  res.json({ success: true, data: profile });
}
export async function updateProfile(req, res) {
  const { skillsToTeach, skillsToLearn, availability } = req.body;
  const profile = await SkillExchange.findOneAndUpdate(
    { userId: req.user.userId },
    { skillsToTeach, skillsToLearn, availability },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: profile, message: "Profile updated" });
}
export async function completeSession(req, res) {
  // teacherId in params, learner is req.user — teacher gains a credit, learner spends one
  const teacher = await SkillExchange.findOne({ userId: req.params.teacherId });
  const learner = await SkillExchange.findOne({ userId: req.user.userId });
  if (!teacher || !learner) return res.status(404).json({ success: false, error: "Profile not found", code: "NOT_FOUND" });
  if (learner.credits <= 0) return res.status(400).json({ success: false, error: "Not enough credits", code: "NO_CREDITS" });
  teacher.credits += 1; teacher.sessionsTaught += 1;
  learner.credits -= 1;
  await teacher.save(); await learner.save();
  res.json({ success: true, message: "Session logged" });
}
