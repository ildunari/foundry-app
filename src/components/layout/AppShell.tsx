import { Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export default function AppShell() {
  return (
    <div className="h-screen w-screen flex bg-shell-bg text-shell-text-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - draggable for Tauri window */}
        <div
          className="h-10 flex items-center px-4 pl-4 flex-shrink-0"
          data-tauri-drag-region=""
        >
          <div className="flex-1">
            <Breadcrumbs />
          </div>
          <button
            type="button"
            className="p-1.5 rounded text-shell-text-tertiary hover:text-shell-text-secondary transition-colors"
            aria-label="Toggle AI panel"
          >
            <Sparkles size={16} />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>

          {/* AI panel slot - another agent will populate this */}
          <div id="ai-panel-slot" className="hidden" />
        </div>
      </div>
    </div>
  );
}
