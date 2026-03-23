import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { useFileContent } from "@/hooks/useFileContent";
import { getAssetPath } from "@/lib/files";
import type { LibraryItem } from "@/lib/types";
import IconGrid from "@/components/viewers/iconography/IconGrid";

const SIZES = [16, 20, 24, 32] as const;
const BG_OPTIONS = [
  { key: "dark", label: "Dark", color: "#0C0C0C" },
  { key: "mid", label: "Mid", color: "#141414" },
  { key: "light", label: "Light", color: "#2A2A2A" },
  { key: "accent", label: "Accent", color: "#1A0F08" },
] as const;

export default function IconographyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { index, isLoading } = useLibrary();

  const [searchQuery, setSearchQuery] = useState("");
  const [iconSize, setIconSize] = useState<number>(24);
  const [bgColor, setBgColor] = useState("dark");

  // Find the item
  const item = useMemo<LibraryItem | undefined>(() => {
    if (!index) return undefined;
    for (const cat of index.categories) {
      const found = cat.items.find((i) => i.slug === slug);
      if (found) return found;
    }
    return undefined;
  }, [index, slug]);

  // Load SPEC.md or README.md
  const [specPath, setSpecPath] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    // Try SPEC.md first, then README.md
    getAssetPath(`iconography/${slug}/SPEC.md`)
      .then(setSpecPath)
      .catch(() => {
        getAssetPath(`iconography/${slug}/README.md`)
          .then(setSpecPath)
          .catch(() => setSpecPath(null));
      });
  }, [slug]);

  const { content: specContent } = useFileContent(specPath);

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
        <p className="text-shell-text-secondary">Item not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-shell-text-secondary hover:text-shell-text-primary transition-colors mb-4 self-start"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">{item.name}</h1>
        {item.description && (
          <p className="text-shell-text-secondary text-sm">{item.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
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
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-shell-border">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-shell-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-shell-bg border border-shell-border rounded-md pl-8 pr-3 py-1.5 text-sm text-shell-text-primary placeholder:text-shell-text-tertiary focus:outline-none focus:border-[#D15010] transition-colors"
          />
        </div>

        {/* Size selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-shell-text-tertiary mr-1">Size</span>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setIconSize(s)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                iconSize === s
                  ? "bg-shell-raised text-shell-text-primary border border-[#D15010]"
                  : "text-shell-text-secondary border border-shell-border hover:text-shell-text-primary hover:border-shell-text-tertiary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Background toggle */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-shell-text-tertiary mr-1">BG</span>
          {BG_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setBgColor(opt.key)}
              className={`w-6 h-6 rounded border transition-all ${
                bgColor === opt.key
                  ? "border-[#D15010] ring-1 ring-[#D15010]"
                  : "border-shell-border hover:border-shell-text-tertiary"
              }`}
              style={{ backgroundColor: opt.color }}
              title={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Icon grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <IconGrid
          slug={slug ?? ""}
          searchQuery={searchQuery}
          iconSize={iconSize}
          bgColor={bgColor}
        />

        {/* Spec content */}
        {specContent && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
              Specification
            </h2>
            <pre className="bg-shell-raised border border-shell-border rounded-lg p-4 text-xs text-shell-text-secondary overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[500px] overflow-y-auto">
              <code>{specContent}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
