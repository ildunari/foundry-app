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
          "flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200",
          isActive
            ? "border-l-[3px] border-[#D15010] text-shell-text-primary bg-[#D15010]/5"
            : "border-l-[3px] border-transparent text-shell-text-secondary hover:text-shell-text-primary hover:bg-white/[0.02]",
        ].join(" ")
      }
    >
      <Icon size={16} />
      <span>{label}</span>
    </NavLink>
  );
}
