import { GameProgress } from "../models/GameProgress.js";
import { awardXP } from "../services/xpService.js";

// 10 mystery levels — story + code snippet + 4 MCQ
export const LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  title: `Mystery Level ${i + 1}`,
  story: `A strange bug has appeared in the code below. Can you figure out what's wrong?`,
  code: `// Level ${i + 1} code with a hidden issue\nint main() {\n    int x;\n    printf("%d", x); // uninitialized variable example\n    return 0;\n}`,
  questions: [
    { q: `What's the bug in Level ${i + 1}?`, options: ["Uninitialized variable", "Missing semicolon", "Wrong data type", "Infinite loop"], answer: 0 },
  ],
}));

function xpForLevel(level) {
  if (level <= 3) return 100;
  if (level <= 6) return 150;
  if (level <= 9) return 200;
  return 300;
}

export async function listLevels(req, res) {
  const progress = await GameProgress.find({ userId: req.user.userId });
  const withStatus = LEVELS.map((l) => ({ ...l, progress: progress.find((p) => p.level === l.level) || null }));
  res.json({ success: true, data: withStatus });
}

export async function completeLevel(req, res) {
  const { level, correctAnswers, timeTakenSeconds } = req.body;
  if (!level) return res.status(400).json({ success: false, error: "level required", code: "MISSING_FIELDS" });
  const existing = await GameProgress.findOne({ userId: req.user.userId, level });
  if (existing?.completed) return res.status(409).json({ success: false, error: "Level already completed", code: "ALREADY_DONE" });

  const xp = xpForLevel(level);
  const progress = await GameProgress.findOneAndUpdate(
    { userId: req.user.userId, level },
    { completed: true, correctAnswers, timeTakenSeconds, xpAwarded: xp },
    { upsert: true, new: true }
  );
  await awardXP(req.user.userId, xp, `Completed Mystery Level ${level}`);
  res.json({ success: true, data: progress, message: `Level ${level} complete! +${xp} XP` });
}
