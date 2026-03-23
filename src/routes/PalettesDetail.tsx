import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { useLibrary } from "@/context/LibraryContext";
import { readFile } from "@/lib/files";
import CopyButton from "@/components/shared/CopyButton";
import type { LibraryItem } from "@/lib/types";

interface PaletteColor {
  name: string;
  value: string;
  group?: string;
}

interface PaletteData {
  name?: string;
  mode?: string;
  groups?: Record<string, Record<string, string>>;
  colors?: Record<string, string>;
}

function Swatch({ color }: { color: PaletteColor }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(color.value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [color.value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex flex-col cursor-pointer"
    >
      <div
        className="w-full h-16 rounded-lg border border-shell-border group-hover:border-shell-text-tertiary transition-colors relative"
        style={{ backgroundColor: color.value }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <Check size={14} className="text-white drop-shadow-md" />
          ) : (
            <Copy size={14} className="text-white drop-shadow-md" />
          )}
        </div>
      </div>
      <span className="text-xs text-shell-text-secondary mt-1.5 truncate w-full">
        {color.name}
      </span>
      <span className="text-[10px] text-shell-text-tertiary font-mono">
        {color.value}
      </span>
    </button>
  );
}

export default function PalettesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { index, isLoading } = useLibrary();

  const [paletteColors, setPaletteColors] = useState<Map<string, PaletteColor[]>>(new Map());
  const [cssContent, setCssContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const item = useMemo<LibraryItem | undefined>(() => {
    if (!index) return undefined;
    for (const cat of index.categories) {
      if (cat.kind !== "palettes") continue;
      return cat.items.find((i) => i.slug === slug);
    }
    return undefined;
  }, [index, slug]);

  useEffect(() => {
    if (!index || !item) return;

    const basePath = `${index.libraryPath}/palettes/${item.slug}`;

    // Try loading palette.json
    readFile(`${basePath}/palette.json`)
      .then((raw) => {
        const data: PaletteData = JSON.parse(raw);
        const grouped = new Map<string, PaletteColor[]>();

        if (data.groups) {
          for (const [groupName, colors] of Object.entries(data.groups)) {
            const list: PaletteColor[] = Object.entries(colors).map(([name, value]) => ({
              name,
              value,
              group: groupName,
            }));
            grouped.set(groupName, list);
          }
        } else if (data.colors) {
          const list: PaletteColor[] = Object.entries(data.colors).map(([name, value]) => ({
            name,
            value,
          }));
          grouped.set("Colors", list);
        }

        setPaletteColors(grouped);
      })
      .catch(() => {
        setLoadError(true);
      });

    // Try loading palette.css
    readFile(`${basePath}/palette.css`)
      .then(setCssContent)
      .catch(() => {
        // Also try tokens.css as fallback
        readFile(`${basePath}/tokens.css`)
          .then(setCssContent)
          .catch(() => {});
      });
  }, [index, item]);

  if (isLoading) {
    return <div className="text-shell-text-secondary">Loading...</div>;
  }

  if (!item) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-shell-text-secondary hover:text-shell-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <p className="text-shell-text-secondary">Palette not found.</p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-shell-text-secondary hover:text-shell-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h1 className="text-2xl font-semibold mb-2">{item.name}</h1>

      <div className="flex items-center gap-2 mb-6">
        {item.familyPrefix && (
          <span className="text-xs bg-shell-raised border border-shell-border rounded px-2 py-0.5 text-shell-text-secondary">
            {item.familyPrefix}
          </span>
        )}
        <span className="text-xs bg-shell-raised border border-shell-border rounded px-2 py-0.5 text-shell-text-secondary">
          {item.status}
        </span>
        <span className="text-xs text-shell-text-tertiary">
          {item.fileCount} files
        </span>
      </div>

      {item.description && (
        <p className="text-shell-text-secondary mb-8">{item.description}</p>
      )}

      {/* Swatches */}
      {paletteColors.size > 0 ? (
        <div className="space-y-8 mb-8">
          {Array.from(paletteColors.entries()).map(([groupName, colors]) => (
            <motion.div
              key={groupName}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xs uppercase tracking-wider text-shell-text-tertiary font-medium mb-3">
                {groupName}
              </h2>
              <div className="grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-10">
                {colors.map((color) => (
                  <Swatch key={`${groupName}-${color.name}`} color={color} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : loadError && item.readmeExcerpt ? (
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-shell-text-tertiary font-medium mb-3">
            Readme
          </h2>
          <pre className="bg-shell-raised border border-shell-border rounded-lg p-4 text-sm text-shell-text-secondary overflow-x-auto whitespace-pre-wrap">
            <code>{item.readmeExcerpt}</code>
          </pre>
        </div>
      ) : loadError ? (
        <div className="bg-shell-raised border border-shell-border rounded-lg p-6 text-sm text-shell-text-tertiary mb-8">
          No palette.json found. Add a palette.json with color definitions to see swatches here.
        </div>
      ) : null}

      {/* CSS Export */}
      {cssContent && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider text-shell-text-tertiary font-medium">
              CSS Export
            </h2>
            <CopyButton
              text={cssContent}
              className="text-xs text-shell-text-tertiary hover:text-shell-text-secondary"
            >
              <Copy size={12} className="mr-1" />
              Copy CSS
            </CopyButton>
          </div>
          <pre className="bg-shell-raised border border-shell-border rounded-lg p-4 text-xs text-shell-text-secondary overflow-x-auto font-mono max-h-[400px] overflow-y-auto">
            <code>{cssContent}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
