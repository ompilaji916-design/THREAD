import { User } from "../models/User.js";
import { BADGES } from "../services/badgeService.js";

export async function getProfile(req, res) {
  const user = await User.findById(req.user.userId);
  const badgeDetails = Object.entries(BADGES).map(([key, val]) => ({ key, ...val, earned: user.badges.includes(key) }));
  res.json({ success: true, data: { user, badgeDetails } });
}

export async function updateProfile(req, res) {
  const { bio, skills, avatar, emergencyContact } = req.body;
  const user = await User.findByIdAndUpdate(req.user.userId, { $set: { bio, skills, avatar, emergencyContact } }, { new: true });
  res.json({ success: true, data: user, message: "Profile updated" });
}
