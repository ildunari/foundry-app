import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useLibrary } from "@/context/LibraryContext";
import type { LibraryItem } from "@/lib/types";

import OverviewTab from "@/components/viewers/systems/OverviewTab";
import ColorsTab from "@/components/viewers/systems/ColorsTab";
import TypographyTab from "@/components/viewers/systems/TypographyTab";
import SpacingTab from "@/components/viewers/systems/SpacingTab";
import PreviewTab from "@/components/viewers/systems/PreviewTab";
import ComponentTab from "@/components/viewers/systems/ComponentTab";

interface TabDef {
  id: string;
  label: string;
  kind: "overview" | "colors" | "typography" | "spacing" | "preview" | "component";
  cssPath?: string; // for component tabs
}

function buildTabs(item: LibraryItem): TabDef[] {
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview", kind: "overview" },
    { id: "colors", label: "Colors", kind: "colors" },
    { id: "typography", label: "Typography", kind: "typography" },
    { id: "spacing", label: "Spacing", kind: "spacing" },
  ];

  // Preview tab (if available)
  if (item.hasPreview || item.manifest?.structure?.preview) {
    tabs.push({ id: "preview", label: "Preview", kind: "preview" });
  }

  // Dynamic component tabs from manifest
  const components = item.manifest?.structure?.components ?? [];
  for (const cssPath of components) {
    const filename = cssPath.split("/").pop() ?? cssPath;
    const name = filename.replace(/\.css$/, "");
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    tabs.push({
      id: `component-${name}`,
      label,
      kind: "component",
      cssPath,
    });
  }

  return tabs;
}

export default function SystemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { index, isLoading } = useLibrary();
  const [activeTab, setActiveTab] = useState("overview");

  // Find the system item
  const item = useMemo<LibraryItem | undefined>(() => {
    if (!index) return undefined;
    for (const cat of index.categories) {
      const found = cat.items.find((i) => i.slug === slug);
      if (found) return found;
    }
    return undefined;
  }, [index, slug]);

  const tabs = useMemo(() => (item ? buildTabs(item) : []), [item]);
  const manifest = item?.manifest;
  const accentColor = manifest?.palette?.accent ?? "#D15010";

  // Token path for color/spacing/typography tabs
  const tokenJsonPath = manifest?.structure?.tokens?.json
    ? `systems/${slug}/${manifest.structure.tokens.json}`
    : null;

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
        <p className="text-shell-text-secondary">System not found.</p>
      </div>
    );
  }

  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

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

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-shell-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
              currentTab.id === tab.id
                ? "text-shell-text-primary"
                : "text-shell-text-secondary hover:text-shell-text-primary"
            }`}
          >
            {tab.label}
            {currentTab.id === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: accentColor }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {currentTab.kind === "overview" && <OverviewTab item={item} />}

        {currentTab.kind === "colors" && tokenJsonPath && (
          <ColorsTab tokenPath={tokenJsonPath} />
        )}

        {currentTab.kind === "typography" &&
          manifest?.heritage?.fontSource &&
          manifest?.typography && (
            <TypographyTab
              fontSource={manifest.heritage.fontSource}
              typography={manifest.typography}
              tokenPath={tokenJsonPath ?? ""}
            />
          )}

        {currentTab.kind === "spacing" && tokenJsonPath && (
          <SpacingTab tokenPath={tokenJsonPath} />
        )}

        {currentTab.kind === "preview" && manifest?.structure?.preview && (
          <PreviewTab previewPath={`systems/${slug}/${manifest.structure.preview}`} />
        )}

        {currentTab.kind === "component" && currentTab.cssPath && (
          <ComponentTab
            key={currentTab.id}
            cssPath={`systems/${slug}/${currentTab.cssPath}`}
            systemSlug={slug ?? ""}
          />
        )}
      </div>
    </div>
  );
}
