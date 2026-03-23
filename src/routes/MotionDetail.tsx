import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useLibrary } from "@/context/LibraryContext";
import { getAssetPath, readFile } from "@/lib/files";
import type { LibraryItem } from "@/lib/types";
import CopyButton from "@/components/shared/CopyButton";
import TokenDashboard from "@/components/viewers/motion/TokenDashboard";
import EasingVisualizer from "@/components/viewers/motion/EasingVisualizer";
import PresetPlayground from "@/components/viewers/motion/PresetPlayground";

type TabId = "tokens" | "easing" | "playground" | "css";

const TABS: { id: TabId; label: string }[] = [
  { id: "tokens", label: "Tokens" },
  { id: "easing", label: "Easing" },
  { id: "playground", label: "Playground" },
  { id: "css", label: "CSS Effects" },
];

/**
 * Parse easing values from the tokens content for the EasingVisualizer.
 */
function parseEasings(
  content: string
): { name: string; values: number[] }[] {
  const result: { name: string; values: number[] }[] = [];
  const block = content.match(
    /export const easing\s*=\s*\{([^}]*(?:\[[^\]]*\])[^}]*)\}/s
  );
  if (!block) return result;
  const entries = block[1].matchAll(/(\w+):\s*\[([\d.,\s]+)\]/g);
  for (const m of entries) {
    const values = m[2].split(",").map((v) => parseFloat(v.trim()));
    if (values.length === 4 && values.every((v) => !isNaN(v))) {
      result.push({ name: m[1], values });
    }
  }
  return result;
}

/**
 * Parse spring configs from the tokens content for the PresetPlayground.
 */
function parseSprings(
  content: string
): { name: string; stiffness: number; damping: number }[] {
  const result: { name: string; stiffness: number; damping: number }[] = [];
  const block = content.match(
    /export const spring\s*=\s*\{([\s\S]*?)\}\s*as\s*const/
  );
  if (!block) return result;
  const entries = block[1].matchAll(
    /(\w+):\s*\{[^}]*stiffness:\s*(\d+)[^}]*damping:\s*(\d+)/g
  );
  for (const m of entries) {
    result.push({
      name: m[1],
      stiffness: parseInt(m[2]),
      damping: parseInt(m[3]),
    });
  }
  return result;
}

export default function MotionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { index, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState<TabId>("tokens");

  // File contents
  const [tokensContent, setTokensContent] = useState<string | null>(null);
  const [cssContent, setCssContent] = useState<string | null>(null);
  const [tokensLoading, setTokensLoading] = useState(true);

  // Find the item
  const item = useMemo<LibraryItem | undefined>(() => {
    if (!index) return undefined;
    for (const cat of index.categories) {
      const found = cat.items.find((i) => i.slug === slug);
      if (found) return found;
    }
    return undefined;
  }, [index, slug]);

  const accentColor = item?.accentColor ?? "#D15010";

  // Load files
  useEffect(() => {
    if (!slug) return;
    setTokensLoading(true);

    const loadFile = (relativePath: string) =>
      getAssetPath(relativePath).then((resolved) => readFile(resolved));

    // Load animation-tokens.ts
    loadFile(`motion/${slug}/animation-tokens.ts`)
      .then(setTokensContent)
      .catch(() => setTokensContent(null));

    // Load terminal-effects.css
    loadFile(`motion/${slug}/terminal-effects.css`)
      .then(setCssContent)
      .catch(() => setCssContent(null));

    // Also try motion-presets.ts as fallback for tokens
    setTokensLoading(false);
  }, [slug]);

  // Derived data
  const easings = useMemo(
    () => (tokensContent ? parseEasings(tokensContent) : []),
    [tokensContent]
  );

  const springs = useMemo(
    () => (tokensContent ? parseSprings(tokensContent) : []),
    [tokensContent]
  );

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
      <div className="mb-2">
        <h1 className="text-2xl font-semibold mb-1">{item.name}</h1>
        {item.description && (
          <p className="text-shell-text-secondary text-sm">
            {item.description}
          </p>
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

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-shell-border mb-6 mt-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-shell-text-primary"
                : "text-shell-text-secondary hover:text-shell-text-primary"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="motion-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: accentColor }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === "tokens" && (
          <>
            {tokensContent ? (
              <TokenDashboard tokensContent={tokensContent} />
            ) : tokensLoading ? (
              <div className="text-shell-text-secondary text-sm">
                Loading tokens...
              </div>
            ) : (
              <div className="text-shell-text-tertiary text-sm">
                No animation tokens found for this item.
              </div>
            )}
          </>
        )}

        {activeTab === "easing" && (
          <EasingVisualizer easings={easings} />
        )}

        {activeTab === "playground" && (
          <PresetPlayground springs={springs} />
        )}

        {activeTab === "css" && (
          <div className="space-y-4">
            {cssContent ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider">
                    CSS Effects
                  </h3>
                  <CopyButton
                    text={cssContent}
                    className="text-xs text-shell-text-tertiary hover:text-shell-text-secondary px-2 py-1 rounded border border-shell-border hover:border-shell-text-tertiary transition-colors"
                  >
                    Copy CSS
                  </CopyButton>
                </div>
                <pre className="bg-shell-raised border border-shell-border rounded-lg p-4 text-xs text-shell-text-secondary overflow-x-auto whitespace-pre font-mono leading-relaxed max-h-[600px] overflow-y-auto">
                  <code>{cssContent}</code>
                </pre>
              </>
            ) : (
              <div className="text-shell-text-tertiary text-sm">
                No CSS effects file found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
