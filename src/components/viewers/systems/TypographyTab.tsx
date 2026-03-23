import { useEffect, useMemo, useState } from "react";
import { useFileContent } from "@/hooks/useFileContent";
import { getAssetPath } from "@/lib/files";

interface TypographyTabProps {
  fontSource: string;
  typography: {
    sans: string;
    mono: string;
    pixel: string | null;
    scaleRatio: number;
  };
  tokenPath: string;
}

interface TypeScaleEntry {
  name: string;
  size: string;
}

interface FontWeightEntry {
  name: string;
  weight: string;
}

export default function TypographyTab({ fontSource, typography, tokenPath }: TypographyTabProps) {
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);

  // Inject font CSS
  useEffect(() => {
    const id = "system-font-link";
    if (!document.getElementById(id) && fontSource) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = fontSource;
      document.head.appendChild(link);
    }
    return () => {
      const el = document.getElementById(id);
      el?.remove();
    };
  }, [fontSource]);

  useEffect(() => {
    getAssetPath(tokenPath).then(setResolvedPath).catch(() => {});
  }, [tokenPath]);

  const { content } = useFileContent(resolvedPath);

  const { typeScale, fontWeights } = useMemo(() => {
    const scale: TypeScaleEntry[] = [];
    const weights: FontWeightEntry[] = [];
    if (!content) return { typeScale: scale, fontWeights: weights };

    try {
      const json = JSON.parse(content);
      const typo = json.typography;
      if (!typo) return { typeScale: scale, fontWeights: weights };

      if (typo.fontSize) {
        for (const [name, val] of Object.entries(typo.fontSize)) {
          const v = val as Record<string, unknown>;
          if (v.$value && typeof v.$value === "string") {
            scale.push({ name, size: v.$value });
          }
        }
      }

      if (typo.fontWeight) {
        for (const [name, val] of Object.entries(typo.fontWeight)) {
          const v = val as Record<string, unknown>;
          if (v.$value) {
            weights.push({ name, weight: String(v.$value) });
          }
        }
      }
    } catch {
      // ignore parse errors
    }

    return { typeScale: scale, fontWeights: weights };
  }, [content]);

  return (
    <div className="space-y-10">
      {/* Font Families */}
      <div>
        <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
          Font Families
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Sans", value: typography.sans },
            { label: "Mono", value: typography.mono },
            ...(typography.pixel ? [{ label: "Pixel", value: typography.pixel }] : []),
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-shell-raised border border-shell-border rounded-lg px-4 py-3"
            >
              <div className="text-xs text-shell-text-tertiary uppercase mb-1">{label}</div>
              <div className="text-sm text-shell-text-primary">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Type Scale */}
      {typeScale.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Type Scale
          </h2>
          <div className="space-y-4">
            {typeScale.map(({ name, size }) => (
              <div key={name} className="flex items-baseline gap-4">
                <span className="text-xs text-shell-text-tertiary font-mono w-20 shrink-0 text-right">
                  {name} ({size})
                </span>
                <span
                  className="text-shell-text-primary truncate"
                  style={{ fontFamily: typography.sans, fontSize: size }}
                >
                  The quick brown fox jumps
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight Showcase */}
      {fontWeights.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Font Weights
          </h2>
          <div className="space-y-3">
            {fontWeights.map(({ name, weight }) => (
              <div key={name} className="flex items-baseline gap-4">
                <span className="text-xs text-shell-text-tertiary font-mono w-24 shrink-0 text-right">
                  {name} ({weight})
                </span>
                <span
                  className="text-lg text-shell-text-primary"
                  style={{ fontFamily: typography.sans, fontWeight: Number(weight) }}
                >
                  Industrial precision meets systematic design
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pairing Demo */}
      <div>
        <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
          Pairing Demo
        </h2>
        <div className="bg-shell-raised border border-shell-border rounded-lg p-6 space-y-3">
          <h3
            className="text-2xl font-semibold text-shell-text-primary"
            style={{ fontFamily: typography.sans }}
          >
            Heading in {typography.sans}
          </h3>
          <p
            className="text-sm text-shell-text-secondary leading-relaxed"
            style={{ fontFamily: typography.mono }}
          >
            Body text in {typography.mono}. This demonstrates how the heading
            and body fonts pair together. The sans-serif provides clear hierarchy
            while the monospace adds technical character to running text, suitable
            for developer tools and terminal interfaces.
          </p>
        </div>
      </div>
    </div>
  );
}
