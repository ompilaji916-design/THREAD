import { SavedEmail } from "../models/SavedEmail.js";
import { ResumePackage } from "../models/ResumePackage.js";
import { DoubtHistory } from "../models/DoubtHistory.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { User } from "../models/User.js";
import { generateEmail, generateResumePackage, generateDoubtAnswer, generateStudyPlan } from "../services/geminiService.js";
import { awardXP } from "../services/xpService.js";

// ---- AI Email Assistant ----
export async function createEmail(req, res) {
  const { templateType, tone, prompt } = req.body;
  if (!templateType || !prompt) return res.status(400).json({ success: false, error: "templateType and prompt required", code: "MISSING_FIELDS" });
  const user = await User.findById(req.user.userId);
  const result = await generateEmail({ templateType, tone: tone || "Formal", prompt, name: user.name, branch: user.branch });
  const saved = await SavedEmail.create({ userId: req.user.userId, templateType, tone: tone || "Formal", prompt, subject: result.subject, body: result.body, aiGenerated: result.aiGenerated });
  res.status(201).json({ success: true, data: saved });
}

export async function listEmails(req, res) {
  const items = await SavedEmail.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: items });
}

// ---- AI Resume Builder ----
export async function createResume(req, res) {
  const { projectName, projectDescription, techStack, role } = req.body;
  if (!projectName || !projectDescription) return res.status(400).json({ success: false, error: "projectName and projectDescription required", code: "MISSING_FIELDS" });
  const result = await generateResumePackage({ projectName, projectDescription, techStack, role });
  const pkg = await ResumePackage.create({ userId: req.user.userId, projectName, projectDescription, techStack, role, ...result });
  await awardXP(req.user.userId, 30, "Generated a resume package");
  res.status(201).json({ success: true, data: pkg, message: "Resume package generated! +30 XP" });
}

export async function listResumes(req, res) {
  const items = await ResumePackage.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

// ---- AI Doubt Solver ----
export async function askDoubt(req, res) {
  const { question, language } = req.body;
  if (!question) return res.status(400).json({ success: false, error: "question required", code: "MISSING_FIELDS" });
  const result = await generateDoubtAnswer({ question, language: language || "C" });
  const saved = await DoubtHistory.create({ userId: req.user.userId, question, language: language || "C", ...result });
  const count = await DoubtHistory.countDocuments({ userId: req.user.userId });
  if (count > 10) {
    const oldest = await DoubtHistory.find({ userId: req.user.userId }).sort({ createdAt: 1 }).limit(count - 10);
    await DoubtHistory.deleteMany({ _id: { $in: oldest.map((o) => o._id) } });
  }
  res.status(201).json({ success: true, data: saved });
}

export async function doubtHistory(req, res) {
  const items = await DoubtHistory.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, data: items });
}

// ---- AI Study Planner ----
export async function createStudyPlan(req, res) {
  const { examName, examDate, subjects, dailyHours, prepLevel } = req.body;
  if (!examName || !examDate || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ success: false, error: "examName, examDate, and subjects are required", code: "MISSING_FIELDS" });
  }
  const { days } = await generateStudyPlan({ examName, examDate, subjects, dailyHours: dailyHours || 2, prepLevel });
  const plan = await StudyPlan.create({ userId: req.user.userId, examName, examDate, subjects, dailyHours: dailyHours || 2, prepLevel, days });
  res.status(201).json({ success: true, data: plan, message: "Study plan created" });
}

export async function listStudyPlans(req, res) {
  const items = await StudyPlan.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}

export async function toggleTask(req, res) {
  const { planId, dayIndex, taskIndex } = req.body;
  const plan = await StudyPlan.findOne({ _id: planId, userId: req.user.userId });
  if (!plan) return res.status(404).json({ success: false, error: "Plan not found", code: "NOT_FOUND" });
  const task = plan.days[dayIndex]?.tasks[taskIndex];
  if (!task) return res.status(404).json({ success: false, error: "Task not found", code: "NOT_FOUND" });
  task.done = !task.done;
  await plan.save();
  res.json({ success: true, data: plan });
}
