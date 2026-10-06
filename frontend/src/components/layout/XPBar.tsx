import { Flame } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export function XPBar() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  // Simple level curve: every 500 XP is a "level"
  const level = Math.floor(user.xp / 500) + 1;
  const progressInLevel = user.xp % 500;
  const pct = (progressInLevel / 500) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col w-32">
        <div className="flex justify-between text-[11px] text-textmuted mb-0.5">
          <span>Lvl {level}</span>
          <span>{user.xp} XP</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
        <Flame size={16} />
        {user.loginStreak}
      </div>
    </div>
  );
}
