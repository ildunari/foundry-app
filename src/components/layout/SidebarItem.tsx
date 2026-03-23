import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

export default function SidebarItem({ icon: Icon, label, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-5 py-2 text-sm transition-colors",
          isActive
            ? "border-l-[3px] border-white text-shell-text-primary"
            : "border-l-[3px] border-transparent text-shell-text-secondary hover:text-shell-text-primary",
        ].join(" ")
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}
