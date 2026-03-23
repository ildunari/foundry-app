import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { onTerminalOutput, resizeTerminal } from "@/lib/terminal";
import "@xterm/xterm/css/xterm.css";

interface TerminalViewProps {
  sessionId: string;
  onData: (data: string) => void;
}

export default function TerminalView({ sessionId, onData }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: "#0C0C0C",
        foreground: "#E0E0E0",
        cursor: "#E0E0E0",
        selectionBackground: "#333333",
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    // Small delay to ensure the container has dimensions before fitting
    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    return () => {
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  // Listen for terminal output events
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    let cancelled = false;
    let unlisten: (() => void) | null = null;

    onTerminalOutput((payload) => {
      if (payload.sessionId === sessionId) {
        term.write(payload.data);
      }
    }).then((fn) => {
      if (cancelled) {
        fn(); // Already unmounted — immediately unsubscribe
      } else {
        unlisten = fn;
      }
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [sessionId]);

  // Connect xterm.onData to the onData prop
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    const disposable = term.onData(onData);

    return () => {
      disposable.dispose();
    };
  }, [onData]);

  // ResizeObserver for auto-fitting and reporting size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const fitAddon = fitAddonRef.current;
      const term = termRef.current;
      if (!fitAddon || !term) return;

      fitAddon.fit();
      resizeTerminal(sessionId, term.cols, term.rows);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [sessionId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0"
      style={{ padding: "4px" }}
    />
  );
}
