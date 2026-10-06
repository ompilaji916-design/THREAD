import { NavLink } from "react-router-dom";
import { MOBILE_NAV } from "./navConfig";

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-borderc flex justify-around z-40">
      {MOBILE_NAV.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/app"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-h-[56px] text-xs font-medium ${
              isActive ? "text-accent" : "text-textmuted"
            }`
          }
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
