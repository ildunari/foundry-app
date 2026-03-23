import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AIPanel from "@/components/ai-panel/AIPanel";
import CommandPalette from "@/components/search/CommandPalette";

export default function AppShell() {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && e.metaKey) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            onClick={() => setIsAIPanelOpen((prev) => !prev)}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              isAIPanelOpen
                ? "text-[#D15010] bg-[#D15010]/10"
                : "text-shell-text-tertiary hover:text-[#D15010] hover:bg-[#D15010]/5"
            }`}
            aria-label="Toggle AI panel"
          >
            <Sparkles size={16} />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>

          <AIPanel
            isOpen={isAIPanelOpen}
            onClose={() => setIsAIPanelOpen(false)}
          />
        </div>
      </div>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
