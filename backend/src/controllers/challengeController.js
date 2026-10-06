import { ChallengeAttempt } from "../models/ChallengeAttempt.js";
import { awardXP } from "../services/xpService.js";

// 20 rotating C challenges (title + prompt + difficulty + hints + solution)
export const CHALLENGES = Array.from({ length: 20 }, (_, i) => ({
  index: i,
  title: `Challenge #${i + 1}`,
  difficulty: ["Easy", "Medium", "Hard"][i % 3],
  prompt: `Write a C program that solves problem #${i + 1} in today's rotation (e.g. array/string/pointer/recursion practice).`,
  hints: [`Hint 1 for challenge ${i + 1}: think about the base case / loop bounds.`, `Hint 2 for challenge ${i + 1}: check off-by-one errors and variable types.`],
  solution: `// Commented sample solution for challenge ${i + 1}\n#include <stdio.h>\nint main() {\n    // solution logic here\n    return 0;\n}`,
}));

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

export async function getTodayChallenge(req, res) {
  const today = new Date();
  const dayKey = today.toISOString().slice(0, 10);
  const challengeIndex = dayOfYear(today) % 20;
  const challenge = CHALLENGES[challengeIndex];
  const attempt = await ChallengeAttempt.findOne({ userId: req.user.userId, dayKey });
  res.json({ success: true, data: { ...challenge, dayKey, attempt } });
}

export async function useHint(req, res) {
  const { dayKey } = req.body;
  let attempt = await ChallengeAttempt.findOne({ userId: req.user.userId, dayKey });
  const challengeIndex = dayOfYear(new Date(dayKey)) % 20;
  if (!attempt) attempt = await ChallengeAttempt.create({ userId: req.user.userId, dayKey, challengeIndex, hintsUsed: 0 });
  attempt.hintsUsed = Math.min(2, attempt.hintsUsed + 1);
  await attempt.save();
  res.json({ success: true, data: attempt });
}

export async function submitChallenge(req, res) {
  const { dayKey } = req.body;
  const challengeIndex = dayOfYear(new Date(dayKey)) % 20;
  const challenge = CHALLENGES[challengeIndex];
  let attempt = await ChallengeAttempt.findOne({ userId: req.user.userId, dayKey });
  if (attempt && attempt.status === "solved") {
    return res.status(409).json({ success: false, error: "Already solved today's challenge", code: "ALREADY_SOLVED" });
  }
  const xpMap = { Easy: 50, Medium: 65, Hard: 80 };
  const xp = xpMap[challenge.difficulty];
  if (!attempt) attempt = await ChallengeAttempt.create({ userId: req.user.userId, dayKey, challengeIndex, status: "solved", xpAwarded: xp });
  else { attempt.status = "solved"; attempt.xpAwarded = xp; await attempt.save(); }
  await awardXP(req.user.userId, xp, "Solved daily challenge");
  res.json({ success: true, data: attempt, message: `Solved! +${xp} XP` });
}

export async function revealSolution(req, res) {
  const { dayKey } = req.body;
  const challengeIndex = dayOfYear(new Date(dayKey)) % 20;
  let attempt = await ChallengeAttempt.findOne({ userId: req.user.userId, dayKey });
  if (!attempt) attempt = await ChallengeAttempt.create({ userId: req.user.userId, dayKey, challengeIndex, status: "viewed_solution" });
  else if (attempt.status !== "solved") { attempt.status = "viewed_solution"; await attempt.save(); }
  res.json({ success: true, data: { solution: CHALLENGES[challengeIndex].solution } });
}

export async function challengeHistory(req, res) {
  const items = await ChallengeAttempt.find({ userId: req.user.userId }).sort({ dayKey: -1 }).limit(30);
  res.json({ success: true, data: items });
}
