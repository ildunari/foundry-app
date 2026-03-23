import { useMemo } from "react";
import { useFileContent } from "@/hooks/useFileContent";
import { getAssetPath } from "@/lib/files";
import { useState, useEffect } from "react";
import SwatchGrid from "@/components/shared/SwatchGrid";
import type { ColorSwatch } from "@/components/shared/SwatchGrid";

interface ColorsTabProps {
  tokenPath: string; // relative path like "systems/forge/tokens/forge.json"
}

interface ColorGroup {
  label: string;
  colors: ColorSwatch[];
}

function extractDTCGColors(obj: Record<string, unknown>, prefix = ""): ColorSwatch[] {
  const results: ColorSwatch[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === "object" && "$value" in (val as Record<string, unknown>)) {
      const v = (val as Record<string, unknown>)["$value"];
      if (typeof v === "string" && v.startsWith("#")) {
        results.push({ name: prefix ? `${prefix}.${key}` : key, value: v });
      }
    } else if (val && typeof val === "object") {
      results.push(...extractDTCGColors(val as Record<string, unknown>, prefix ? `${prefix}.${key}` : key));
    }
  }
  return results;
}

export default function ColorsTab({ tokenPath }: ColorsTabProps) {
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);

  useEffect(() => {
    getAssetPath(tokenPath).then(setResolvedPath).catch(() => {});
  }, [tokenPath]);

  const { content, loading, error } = useFileContent(resolvedPath);

  const groups = useMemo<ColorGroup[]>(() => {
    if (!content) return [];
    try {
      const json = JSON.parse(content);
      const color = json.color;
      if (!color) return [];

      const result: ColorGroup[] = [];

      // Background
      if (color.background) {
        result.push({
          label: "Backgrounds",
          colors: extractDTCGColors(color.background),
        });
      }

      // Gray scale
      if (color.gray) {
        result.push({
          label: "Gray Scale",
          colors: extractDTCGColors(color.gray),
        });
      }

      // Accent scale
      if (color.accent) {
        result.push({
          label: "Accent Scale",
          colors: extractDTCGColors(color.accent),
        });
      }

      // Text colors
      if (color.text) {
        result.push({
          label: "Text Colors",
          colors: extractDTCGColors(color.text),
        });
      }

      // Border colors
      if (color.border) {
        result.push({
          label: "Border Colors",
          colors: extractDTCGColors(color.border),
        });
      }

      // Semantic colors
      if (color.semantic) {
        for (const [name, value] of Object.entries(color.semantic)) {
          result.push({
            label: `Semantic: ${name.charAt(0).toUpperCase() + name.slice(1)}`,
            colors: extractDTCGColors(value as Record<string, unknown>),
          });
        }
      }

      return result;
    } catch {
      return [];
    }
  }, [content]);

  if (loading) {
    return <div className="text-shell-text-secondary text-sm">Loading colors...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">Failed to load tokens: {error}</div>;
  }

  if (groups.length === 0) {
    return <div className="text-shell-text-tertiary text-sm">No color tokens found.</div>;
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-4">
            {group.label}
          </h2>
          <SwatchGrid
            colors={group.colors}
            columns={group.colors.length <= 5 ? group.colors.length : 10}
          />
        </div>
      ))}
    </div>
  );
}
