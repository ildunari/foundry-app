import { X } from "lucide-react";

interface PanelHeaderProps {
  isActive: boolean;
  onClose: () => void;
}

export default function PanelHeader({ isActive, onClose }: PanelHeaderProps) {
  return (
    <div className="h-10 flex items-center justify-between px-4 border-b border-shell-border flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-shell-text-secondary">AI Terminal</span>
        <span
          className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-shell-text-tertiary"}`}
        />
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded text-shell-text-tertiary hover:text-shell-text-secondary transition-colors"
        aria-label="Close AI panel"
      >
        <X size={14} />
      </button>
    </div>
  );
}
