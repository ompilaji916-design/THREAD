import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { XPBar } from "./XPBar";
import { NotificationBell } from "./NotificationBell";
import { useAuthStore } from "../../stores/authStore";

export function TopBar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-borderc px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-bold text-textmain">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <XPBar />
        <NotificationBell />
        <Link
          to="/app/profile"
          aria-label="Go to your profile"
          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </Link>
      </div>
    </header>
  );
}
