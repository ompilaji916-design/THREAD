import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";
import { NAV_GROUPS } from "./navConfig";
import { useAuthStore } from "../../stores/authStore";
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

function currentTitle(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.path === pathname) return item.label;
    }
  }
  return "THREAD";
}

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-borderc">
              <span className="font-extrabold text-accent text-lg">THREAD</span>
              <button onClick={() => setDrawerOpen(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <nav className="px-3 py-3 space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="px-2 mb-1 text-xs font-semibold text-textmuted uppercase">{group.title}</p>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-textsub hover:bg-gray-50 min-h-[44px]"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar title={currentTitle(location.pathname)} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
