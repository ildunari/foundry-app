import { useState } from "react";
import { motion } from "motion/react";

interface PresetPlaygroundProps {
  springs: { name: string; stiffness: number; damping: number }[];
}

const SPEED_OPTIONS = [
  { label: "0.1x", multiplier: 10 },
  { label: "0.5x", multiplier: 2 },
  { label: "1x", multiplier: 1 },
] as const;

function SpringCard({
  name,
  stiffness,
  damping,
  speedMultiplier,
}: {
  name: string;
  stiffness: number;
  damping: number;
  speedMultiplier: number;
}) {
  const [triggered, setTriggered] = useState(false);

  return (
    <div className="bg-shell-raised border border-shell-border rounded-lg p-5 space-y-4">
      {/* Header */}
      <div>
        <span className="text-sm font-mono text-shell-text-primary block mb-2">
          {name}
        </span>
        <div className="flex gap-4 text-xs">
          <span className="text-shell-text-tertiary">
            stiffness{" "}
            <span className="font-mono text-shell-text-secondary">
              {stiffness}
            </span>
          </span>
          <span className="text-shell-text-tertiary">
            damping{" "}
            <span className="font-mono text-shell-text-secondary">
              {damping}
            </span>
          </span>
        </div>
      </div>

      {/* Demo area */}
      <button
        type="button"
        onClick={() => setTriggered((t) => !t)}
        className="w-full"
      >
        <div className="relative h-16 bg-shell-bg rounded-md border border-shell-border flex items-center overflow-hidden px-4">
          <motion.div
            className="w-10 h-10 rounded-md"
            style={{ backgroundColor: "#D15010" }}
            animate={{
              x: triggered ? 120 : 0,
              scale: triggered ? 1.1 : 1,
              borderRadius: triggered ? "50%" : "6px",
            }}
            transition={{
              type: "spring",
              stiffness: stiffness / speedMultiplier,
              damping: damping / Math.sqrt(speedMultiplier),
            }}
          />
          <span className="absolute right-3 text-[10px] text-shell-text-tertiary">
            Click to trigger
          </span>
        </div>
      </button>
    </div>
  );
}

export default function PresetPlayground({ springs }: PresetPlaygroundProps) {
  const [speedIdx, setSpeedIdx] = useState(2); // default 1x

  if (springs.length === 0) {
    return (
      <div className="text-shell-text-tertiary text-sm">
        No spring presets found.
      </div>
    );
  }

  const currentSpeed = SPEED_OPTIONS[speedIdx];

  return (
    <div className="space-y-6">
      {/* Speed control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-shell-text-tertiary">Speed</span>
        {SPEED_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setSpeedIdx(i)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              speedIdx === i
                ? "bg-shell-raised text-shell-text-primary border border-[#D15010]"
                : "text-shell-text-secondary border border-shell-border hover:text-shell-text-primary hover:border-shell-text-tertiary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Spring cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {springs.map((s) => (
          <SpringCard
            key={s.name}
            name={s.name}
            stiffness={s.stiffness}
            damping={s.damping}
            speedMultiplier={currentSpeed.multiplier}
          />
        ))}
      </div>
    </div>
  );
}
