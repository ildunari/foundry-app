import { useState, useMemo, useEffect } from "react";
import { readFile, getAssetPath, listFiles } from "@/lib/files";
import IconDetail from "./IconDetail";

interface IconGridProps {
  slug: string;
  searchQuery: string;
  iconSize: number;
  bgColor: string;
}

interface ParsedIcon {
  name: string;
  source: string;
}

/**
 * Parse exported function names and their source code from a TSX icon file.
 * Looks for `export function FooIcon(...)` patterns.
 */
function parseIcons(content: string): ParsedIcon[] {
  const icons: ParsedIcon[] = [];
  const exportRegex = /^export function (\w+)\(/gm;
  let match: RegExpExecArray | null;
  const matches: { name: string; startIndex: number }[] = [];

  while ((match = exportRegex.exec(content)) !== null) {
    matches.push({ name: match[1], startIndex: match.index });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].startIndex;
    const end = i + 1 < matches.length ? matches[i + 1].startIndex : content.length;
    const source = content.slice(start, end).trimEnd();
    icons.push({ name: matches[i].name, source });
  }

  return icons;
}

const bgClasses: Record<string, string> = {
  dark: "bg-shell-bg",
  mid: "bg-shell-raised",
  light: "bg-[#2A2A2A]",
  accent: "bg-[#1A0F08]",
};

export default function IconGrid({ slug, searchQuery, iconSize, bgColor }: IconGridProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Try to load the main TSX icon file
    getAssetPath(`iconography/${slug}/ToolIcons.tsx`)
      .then((resolved) => readFile(resolved))
      .then((content) => {
        setFileContent(content);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: try to list and load any .tsx file
        getAssetPath(`iconography/${slug}`)
          .then((dir) =>
            listFiles(dir).then((files) => {
              const tsx = files.find((f) => f.endsWith(".tsx"));
              if (tsx) return readFile(tsx);
              throw new Error("No icon file found");
            }),
          )
          .then((content) => {
            setFileContent(content);
            setLoading(false);
          })
          .catch((e) => {
            setError(String(e));
            setLoading(false);
          });
      });
  }, [slug]);

  const icons = useMemo(() => {
    if (!fileContent) return [];
    return parseIcons(fileContent);
  }, [fileContent]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return icons;
    const q = searchQuery.toLowerCase();
    return icons.filter((icon) => icon.name.toLowerCase().includes(q));
  }, [icons, searchQuery]);

  if (loading) {
    return (
      <div className="text-shell-text-secondary text-sm py-8 text-center">
        Loading icons...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-8 text-center">
        Failed to load icon file: {error}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-shell-text-tertiary text-sm py-8 text-center">
        {searchQuery ? "No icons match your search." : "No icons found in this set."}
      </div>
    );
  }

  const bgClass = bgClasses[bgColor] ?? bgClasses.dark;

  return (
    <div className="space-y-6">
      {/* Grid of icon cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((icon) => (
          <button
            key={icon.name}
            type="button"
            onClick={() =>
              setSelectedIcon(selectedIcon === icon.name ? null : icon.name)
            }
            className={`group flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-150 ${
              selectedIcon === icon.name
                ? "border-[#D15010] bg-shell-raised"
                : "border-shell-border hover:border-shell-text-tertiary bg-shell-raised"
            }`}
          >
            {/* Icon preview area */}
            <div
              className={`flex items-center justify-center rounded-md ${bgClass} w-full aspect-square transition-colors`}
              style={{ maxWidth: iconSize * 3, maxHeight: iconSize * 3 }}
            >
              <div
                className="font-mono text-shell-text-primary flex items-center justify-center"
                style={{ width: iconSize, height: iconSize, fontSize: iconSize * 0.5 }}
              >
                {/* SVG placeholder -- we can't render the actual TSX component */}
                <svg
                  width={iconSize}
                  height={iconSize}
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-shell-text-secondary"
                >
                  <rect
                    x="1"
                    y="1"
                    width="14"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                  <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.4" />
                </svg>
              </div>
            </div>
            {/* Icon name */}
            <span className="text-xs text-shell-text-secondary truncate w-full text-center group-hover:text-shell-text-primary transition-colors">
              {icon.name}
            </span>
          </button>
        ))}
      </div>

      {/* Detail panel for selected icon */}
      {selectedIcon && (
        <IconDetail
          iconName={selectedIcon}
          sourceCode={
            icons.find((i) => i.name === selectedIcon)?.source ?? ""
          }
        />
      )}
    </div>
  );
}
