import { useCallback, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTerminalSession } from "@/hooks/useTerminalSession";
import { writeTerminal } from "@/lib/terminal";
import PanelHeader from "@/components/ai-panel/PanelHeader";
import TerminalView from "@/components/ai-panel/TerminalView";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 400;

export default function AIPanel({ isOpen, onClose }: AIPanelProps) {
  const { sessionId, isActive, error, spawn, close } = useTerminalSession();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);

  const handleClose = useCallback(async () => {
    await close();
    onClose();
  }, [close, onClose]);

  const handleData = useCallback(
    (data: string) => {
      if (sessionId) {
        writeTerminal(sessionId, data);
      }
    },
    [sessionId],
  );

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const onMove = (me: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX - me.clientX;
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta)));
    };

    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="flex-shrink-0 bg-shell-bg border-l border-shell-border flex flex-col h-full relative"
          style={{ width }}
        >
          {/* Resize handle */}
          <div
            onMouseDown={startResize}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-[#D15010]/40 group-active:bg-[#D15010]/60 transition-colors" />
          </div>

          {sessionId && isActive ? (
            <>
              <PanelHeader isActive={isActive} onClose={handleClose} />
              <TerminalView sessionId={sessionId} onData={handleData} />
            </>
          ) : (
            <>
              <PanelHeader isActive={false} onClose={onClose} />
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D15010]/20 to-[#D15010]/5 flex items-center justify-center mb-4 border border-[#D15010]/10">
                  <span className="text-[#D15010] text-lg">AI</span>
                </div>
                <p className="text-sm text-shell-text-secondary text-center mb-4">
                  Start an AI session to create new design assets
                </p>
                {error && (
                  <p className="text-xs text-red-400 mb-3 text-center">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={spawn}
                  className="bg-shell-raised hover:bg-shell-popover border border-shell-border hover:border-[#D15010]/30 rounded-lg px-5 py-2.5 text-sm text-shell-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D15010]/5"
                >
                  New Session
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
