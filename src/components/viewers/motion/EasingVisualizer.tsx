import { useState } from "react";
import { motion } from "motion/react";

interface EasingVisualizerProps {
  easings: { name: string; values: number[] }[];
}

/**
 * Draw a cubic-bezier curve as an SVG path.
 * Control points are mapped into a 100x100 viewBox.
 */
function bezierPath(values: number[]): string {
  const [x1, y1, x2, y2] = values;
  // SVG coordinates: (0,100) is start (bottom-left), (100,0) is end (top-right)
  const sx = 0;
  const sy = 100;
  const ex = 100;
  const ey = 0;
  const cp1x = x1 * 100;
  const cp1y = 100 - y1 * 100;
  const cp2x = x2 * 100;
  const cp2y = 100 - y2 * 100;
  return `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`;
}

function EasingCard({ name, values }: { name: string; values: number[] }) {
  const [playKey, setPlayKey] = useState(0);
  const [x1, y1, x2, y2] = values;
  const cubicBezier = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

  return (
    <div className="bg-shell-raised border border-shell-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-shell-text-primary">{name}</span>
        <span className="text-[10px] font-mono text-shell-text-tertiary">
          {cubicBezier}
        </span>
      </div>

      {/* SVG curve */}
      <svg
        viewBox="-5 -5 110 110"
        className="w-full aspect-square max-w-[160px]"
        fill="none"
      >
        {/* Grid lines */}
        <line x1="0" y1="0" x2="0" y2="100" stroke="#1A1A1A" strokeWidth="1" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="#1A1A1A" strokeWidth="1" />
        {/* Diagonal reference (linear) */}
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="0"
          stroke="#333"
          strokeWidth="0.5"
          strokeDasharray="4 3"
        />
        {/* Control point lines */}
        <line
          x1="0"
          y1="100"
          x2={x1 * 100}
          y2={100 - y1 * 100}
          stroke="#666"
          strokeWidth="0.75"
        />
        <line
          x1="100"
          y1="0"
          x2={x2 * 100}
          y2={100 - y2 * 100}
          stroke="#666"
          strokeWidth="0.75"
        />
        {/* Curve */}
        <path
          d={bezierPath(values)}
          stroke="#D15010"
          strokeWidth="2"
          fill="none"
        />
        {/* Control points */}
        <circle cx={x1 * 100} cy={100 - y1 * 100} r="3" fill="#D15010" />
        <circle cx={x2 * 100} cy={100 - y2 * 100} r="3" fill="#D15010" />
        {/* Start/end points */}
        <circle cx="0" cy="100" r="2.5" fill="#E0E0E0" />
        <circle cx="100" cy="0" r="2.5" fill="#E0E0E0" />
      </svg>

      {/* Animation demo */}
      <button
        type="button"
        onClick={() => setPlayKey((k) => k + 1)}
        className="w-full group"
      >
        <div className="relative h-8 bg-shell-bg rounded-md border border-shell-border overflow-hidden">
          <motion.div
            key={playKey}
            className="absolute top-1 bottom-1 w-6 rounded-sm"
            style={{ backgroundColor: "#D15010", left: 4 }}
            initial={{ x: 0 }}
            animate={{ x: "calc(100% + 40px)" }}
            transition={{
              duration: 0.8,
              ease: values as [number, number, number, number],
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-shell-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
            Click to replay
          </span>
        </div>
      </button>
    </div>
  );
}

export default function EasingVisualizer({ easings }: EasingVisualizerProps) {
  if (easings.length === 0) {
    return (
      <div className="text-shell-text-tertiary text-sm">
        No easing functions found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {easings.map((e) => (
        <EasingCard key={e.name} name={e.name} values={e.values} />
      ))}
    </div>
  );
}
