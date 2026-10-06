import { User } from "../models/User.js";
import { Experience } from "../models/Experience.js";
import { GameProgress } from "../models/GameProgress.js";
import { ResumePackage } from "../models/ResumePackage.js";
import { notify } from "./notificationService.js";

// The 10 badges, each with a check condition
export const BADGES = {
  first_blood: { name: "First Blood", description: "Complete Mystery Level 1" },
  speed_solver: { name: "Speed Solver", description: "Complete 5+ Mystery levels" },
  mystery_master: { name: "Mystery Master", description: "Complete all 10 Mystery levels" },
  scholar: { name: "Scholar", description: "Reach 500 XP" },
  streak_king: { name: "Streak King", description: "7-day login streak" },
  xp_master: { name: "XP Master", description: "Reach 2000 XP" },
  helper: { name: "Helper", description: "Publish 5+ learning posts" },
  no_hints: { name: "No Hints", description: "Solve 3+ levels without hints" },
  resume_pro: { name: "Resume Pro", description: "Generate 3+ resume packages" },
  speedrun: { name: "Speedrun", description: "Complete any level under 120 seconds" },
};

export async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return [];
  const earned = new Set(user.badges || []);
  const newlyEarned = [];

  const gp = await GameProgress.find({ userId, completed: true });
  const completedLevels = gp.map((g) => g.level);

  const checks = {
    first_blood: completedLevels.includes(1),
    speed_solver: completedLevels.length >= 5,
    mystery_master: completedLevels.length >= 10,
    scholar: user.xp >= 500,
    streak_king: user.loginStreak >= 7,
    xp_master: user.xp >= 2000,
    helper: (await Experience.countDocuments({ userId })) >= 5,
    no_hints: (await GameProgress.countDocuments({ userId, completed: true, hintsUsed: 0 })) >= 3,
    resume_pro: (await ResumePackage.countDocuments({ userId })) >= 3,
    speedrun: gp.some((g) => g.timeTakenSeconds && g.timeTakenSeconds < 120),
  };

  for (const [key, earnedNow] of Object.entries(checks)) {
    if (earnedNow && !earned.has(key)) {
      earned.add(key);
      newlyEarned.push(key);
    }
  }

  if (newlyEarned.length) {
    user.badges = Array.from(earned);
    await user.save();
    for (const key of newlyEarned) {
      await notify(userId, {
        type: "badge_earned",
        title: `Badge Earned: ${BADGES[key].name}`,
        message: BADGES[key].description,
        priority: "high",
      });
    }
  }
  return newlyEarned;
}
