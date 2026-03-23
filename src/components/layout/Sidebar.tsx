import { Settings } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import { CATEGORIES } from "@/lib/constants";
import SidebarItem from "@/components/layout/SidebarItem";

export default function Sidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-shell-border flex flex-col pt-[70px]">
      <div className="px-5 pb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-shell-text-tertiary">
          Foundry
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {CATEGORIES.map((cat) => (
          <SidebarItem
            key={cat.kind}
            icon={cat.icon}
            label={cat.label}
            to={cat.path}
          />
        ))}
      </nav>

      <div className="mt-auto">
        <Separator.Root className="h-px bg-shell-border mx-4 my-2" />
        <SidebarItem icon={Settings} label="Settings" to="/settings" />
        <div className="h-4" />
      </div>
    </aside>
  );
}
