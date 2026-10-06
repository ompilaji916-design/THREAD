import { NavLink } from "react-router-dom";
import { NAV_GROUPS } from "./navConfig";

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-[240px] shrink-0 bg-white border-r border-borderc h-screen sticky top-0 overflow-y-auto">
      <div className="px-5 py-5 border-b border-borderc">
        <span className="text-xl font-extrabold text-accent">THREAD</span>
        <p className="text-xs text-textmuted mt-0.5">Student Life OS</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-1 text-xs font-semibold text-textmuted uppercase tracking-wide">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/app"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium min-h-[40px] ${
                      isActive ? "bg-indigo-50 text-accent" : "text-textsub hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
