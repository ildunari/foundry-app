import { useMemo, useState } from "react";
import { motion } from "motion/react";
import CopyButton from "@/components/shared/CopyButton";

interface TokenDashboardProps {
  tokensContent: string;
}

interface DurationEntry {
  name: string;
  value: number;
}
interface EasingEntry {
  name: string;
  values: number[];
}
interface SpringEntry {
  name: string;
  stiffness: number;
  damping: number;
}
interface StaggerEntry {
  name: string;
  value: number;
}
interface ColorGroup {
  name: string;
  entries: { name: string; value: string }[];
}

interface ParsedTokens {
  durations: DurationEntry[];
  easings: EasingEntry[];
  springs: SpringEntry[];
  staggers: StaggerEntry[];
  colors: ColorGroup[];
}

/**
 * Parse the animation-tokens.ts text content to extract token values.
 * This is a text parser -- we can't import the module at runtime.
 */
function parseTokens(content: string): ParsedTokens {
  const durations: DurationEntry[] = [];
  const easings: EasingEntry[] = [];
  const springs: SpringEntry[] = [];
  const staggers: StaggerEntry[] = [];
  const colors: ColorGroup[] = [];

  // Parse duration block
  const durationBlock = content.match(/export const duration\s*=\s*\{([^}]+)\}/s);
  if (durationBlock) {
    const pairs = durationBlock[1].matchAll(/(\w+):\s*([\d.]+)/g);
    for (const m of pairs) {
      durations.push({ name: m[1], value: parseFloat(m[2]) });
    }
  }

  // Parse easing block
  const easingBlock = content.match(/export const easing\s*=\s*\{([^}]*(?:\[[^\]]*\])[^}]*)\}/s);
  if (easingBlock) {
    const entries = easingBlock[1].matchAll(/(\w+):\s*\[([\d.,\s]+)\]/g);
    for (const m of entries) {
      const values = m[2].split(",").map((v) => parseFloat(v.trim()));
      if (values.length === 4 && values.every((v) => !isNaN(v))) {
        easings.push({ name: m[1], values });
      }
    }
  }

  // Parse spring block
  const springBlock = content.match(/export const spring\s*=\s*\{([\s\S]*?)\}\s*as\s*const/);
  if (springBlock) {
    const entries = springBlock[1].matchAll(
      /(\w+):\s*\{[^}]*stiffness:\s*(\d+)[^}]*damping:\s*(\d+)/g
    );
    for (const m of entries) {
      springs.push({
        name: m[1],
        stiffness: parseInt(m[2]),
        damping: parseInt(m[3]),
      });
    }
  }

  // Parse stagger block
  const staggerBlock = content.match(/export const stagger\s*=\s*\{([^}]+)\}/s);
  if (staggerBlock) {
    const pairs = staggerBlock[1].matchAll(/(\w+):\s*([\d.]+)/g);
    for (const m of pairs) {
      staggers.push({ name: m[1], value: parseFloat(m[2]) });
    }
  }

  // Parse color blocks
  const colorBlock = content.match(/export const color\s*=\s*\{([\s\S]*?)\}\s*as\s*const/);
  if (colorBlock) {
    // Match named sub-objects like bg: { ... }, text: { ... }
    const subObjects = colorBlock[1].matchAll(
      /(\w+):\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g
    );
    for (const sub of subObjects) {
      const groupName = sub[1];
      const entries: { name: string; value: string }[] = [];
      const colorPairs = sub[2].matchAll(/(\w+):\s*"(#[0-9A-Fa-f]{3,8})"/g);
      for (const cp of colorPairs) {
        entries.push({ name: cp[1], value: cp[2] });
      }
      if (entries.length > 0) {
        colors.push({ name: groupName, entries });
      }
    }
  }

  return { durations, easings, springs, staggers, colors };
}

export default function TokenDashboard({ tokensContent }: TokenDashboardProps) {
  const tokens = useMemo(() => parseTokens(tokensContent), [tokensContent]);
  const [animKey, setAnimKey] = useState(0);

  const maxDuration = Math.max(...tokens.durations.map((d) => d.value), 1);

  return (
    <div className="space-y-10">
      {/* Durations */}
      {tokens.durations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider">
              Durations
            </h3>
            <button
              type="button"
              onClick={() => setAnimKey((k) => k + 1)}
              className="text-xs text-shell-text-tertiary hover:text-shell-text-primary border border-shell-border rounded px-2 py-1 transition-colors"
            >
              Replay
            </button>
          </div>
          <div className="space-y-3">
            {tokens.durations.map((d) => (
              <div key={d.name} className="flex items-center gap-4">
                <span className="text-xs font-mono text-shell-text-secondary w-20 shrink-0">
                  {d.name}
                </span>
                <div className="flex-1 h-6 bg-shell-bg rounded-md overflow-hidden border border-shell-border">
                  <motion.div
                    key={`${d.name}-${animKey}`}
                    className="h-full rounded-md"
                    style={{ backgroundColor: "#D15010" }}
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(d.value / maxDuration) * 100}%`,
                    }}
                    transition={{
                      duration: d.value,
                      ease: "easeOut",
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-shell-text-tertiary w-12 text-right shrink-0">
                  {d.value}s
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Staggers */}
      {tokens.staggers.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Stagger Values
          </h3>
          <div className="space-y-4">
            {tokens.staggers.map((s) => (
              <div key={s.name}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-shell-text-secondary">
                    {s.name}
                  </span>
                  <span className="text-xs font-mono text-shell-text-tertiary">
                    {s.value}s
                  </span>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`${s.name}-${i}-${animKey}`}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#D15010" }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: i * s.value,
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Springs */}
      {tokens.springs.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Spring Configs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tokens.springs.map((s) => (
              <div
                key={s.name}
                className="bg-shell-raised border border-shell-border rounded-lg p-4"
              >
                <span className="text-sm font-mono text-shell-text-primary block mb-3">
                  {s.name}
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-shell-text-tertiary">stiffness</span>
                    <span className="font-mono text-shell-text-secondary">
                      {s.stiffness}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-shell-text-tertiary">damping</span>
                    <span className="font-mono text-shell-text-secondary">
                      {s.damping}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Colors */}
      {tokens.colors.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Color Tokens
          </h3>
          <div className="space-y-6">
            {tokens.colors.map((group) => (
              <div key={group.name}>
                <span className="text-xs font-mono text-shell-text-secondary block mb-2">
                  {group.name}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {group.entries.map((entry) => (
                    <CopyButton
                      key={entry.name}
                      text={entry.value}
                      className="group flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-10 h-10 rounded-md border border-shell-border group-hover:ring-1 group-hover:ring-shell-text-tertiary transition-all"
                        style={{ backgroundColor: entry.value }}
                      />
                      <span className="text-[10px] font-mono text-shell-text-tertiary group-hover:text-shell-text-secondary transition-colors">
                        {entry.name}
                      </span>
                    </CopyButton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
