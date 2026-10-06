import { User } from "../models/User.js";
import { notify } from "./notificationService.js";
import { checkAndAwardBadges } from "./badgeService.js";
import { broadcast } from "./socketService.js";

// The ONE place that adds XP. Every module calls this — never mutate user.xp directly.
export async function awardXP(userId, amount, reason = "") {
  const user = await User.findByIdAndUpdate(userId, { $inc: { xp: amount } }, { new: true });
  if (!user) return null;

  broadcast("leaderboard:update", { userId: String(userId), xp: user.xp, name: user.name });
  await checkAndAwardBadges(userId);

  return user;
}

const MILESTONES = [7, 14, 30, 60, 100];

export async function checkStreakMilestone(userId, streak) {
  if (!MILESTONES.includes(streak)) return;
  const bonus = streak === 100 ? 125 : 25;
  await awardXP(userId, bonus, `${streak}-day streak milestone`);
  await notify(userId, {
    type: "streak_milestone",
    title: `${streak}-Day Streak!`,
    message: `You've logged in ${streak} days in a row. +${bonus} XP awarded.`,
    priority: "high",
  });
}
