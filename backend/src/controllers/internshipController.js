import { Internship } from "../models/Internship.js";
import { awardXP } from "../services/xpService.js";

export async function listInternships(req, res) {
  const items = await Internship.find().sort({ deadline: 1 });
  res.json({ success: true, data: items });
}
export async function createInternship(req, res) {
  const { company, role, description, deadline, requiredSkills } = req.body;
  if (!company || !role || !deadline) return res.status(400).json({ success: false, error: "company, role, deadline required", code: "MISSING_FIELDS" });
  const item = await Internship.create({ postedBy: req.user.userId, company, role, description, deadline, requiredSkills });
  res.status(201).json({ success: true, data: item, message: "Internship posted" });
}
export async function applyInternship(req, res) {
  const item = await Internship.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" });
  const uid = req.user.userId;
  if (item.applicants.some((a) => String(a) === String(uid))) {
    return res.status(409).json({ success: false, error: "Already applied", code: "ALREADY_APPLIED" });
  }
  item.applicants.push(uid);
  await item.save();
  await awardXP(uid, 10, "Applied to internship");
  res.json({ success: true, data: item, message: "Applied! +10 XP" });
}
