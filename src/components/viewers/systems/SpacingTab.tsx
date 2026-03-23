import { useMemo, useState, useEffect } from "react";
import { useFileContent } from "@/hooks/useFileContent";
import { getAssetPath } from "@/lib/files";

interface SpacingTabProps {
  tokenPath: string;
}

interface SpacingEntry {
  name: string;
  value: string;
}

export default function SpacingTab({ tokenPath }: SpacingTabProps) {
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);

  useEffect(() => {
    getAssetPath(tokenPath).then(setResolvedPath).catch(() => {});
  }, [tokenPath]);

  const { content, loading, error } = useFileContent(resolvedPath);

  const { spacing, radius } = useMemo(() => {
    const spacingArr: SpacingEntry[] = [];
    const radiusArr: SpacingEntry[] = [];
    if (!content) return { spacing: spacingArr, radius: radiusArr };

    try {
      const json = JSON.parse(content);

      if (json.spacing) {
        for (const [name, val] of Object.entries(json.spacing)) {
          const v = val as Record<string, unknown>;
          if (v.$value !== undefined) {
            spacingArr.push({ name, value: String(v.$value) });
          }
        }
      }

      if (json.radius) {
        for (const [name, val] of Object.entries(json.radius)) {
          const v = val as Record<string, unknown>;
          if (v.$value !== undefined) {
            radiusArr.push({ name, value: String(v.$value) });
          }
        }
      }
    } catch {
      // ignore
    }

    return { spacing: spacingArr, radius: radiusArr };
  }, [content]);

  if (loading) {
    return <div className="text-shell-text-secondary text-sm">Loading spacing tokens...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">Failed to load tokens: {error}</div>;
  }

  return (
    <div className="space-y-10">
      {/* Spacing Scale */}
      {spacing.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Spacing Scale
          </h2>
          <div className="space-y-2">
            {spacing.map(({ name, value }) => (
              <div key={name} className="flex items-center gap-4">
                <span className="text-xs text-shell-text-tertiary font-mono w-24 shrink-0 text-right">
                  {name} ({value})
                </span>
                <div className="flex-1 flex items-center">
                  <div
                    className="h-4 rounded-sm bg-shell-text-tertiary/30"
                    style={{
                      width: value === "0" ? "2px" : `clamp(2px, ${value}, 100%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Radius Samples */}
      {radius.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            Border Radius
          </h2>
          <div className="flex flex-wrap gap-4">
            {radius.map(({ name, value }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 bg-shell-text-tertiary/20 border border-shell-border"
                  style={{ borderRadius: value }}
                />
                <div className="text-center">
                  <div className="text-xs text-shell-text-secondary">{name}</div>
                  <div className="text-[10px] text-shell-text-tertiary font-mono">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
