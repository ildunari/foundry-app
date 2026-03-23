import { useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTerminalSession } from "@/hooks/useTerminalSession";
import { writeTerminal } from "@/lib/terminal";
import PanelHeader from "@/components/ai-panel/PanelHeader";
import TerminalView from "@/components/ai-panel/TerminalView";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIPanel({ isOpen, onClose }: AIPanelProps) {
  const { sessionId, isActive, spawn, close } = useTerminalSession();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-[400px] flex-shrink-0 bg-shell-bg border-l border-shell-border flex flex-col h-full"
        >
          {sessionId && isActive ? (
            <>
              <PanelHeader isActive={isActive} onClose={handleClose} />
              <TerminalView sessionId={sessionId} onData={handleData} />
            </>
          ) : (
            <>
              <PanelHeader isActive={false} onClose={onClose} />
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <p className="text-sm text-shell-text-secondary text-center mb-4">
                  Start an AI session to create new design assets
                </p>
                <button
                  type="button"
                  onClick={spawn}
                  className="bg-shell-raised hover:bg-shell-popover rounded px-4 py-2 text-sm text-shell-text-primary transition-colors"
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
