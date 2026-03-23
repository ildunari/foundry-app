import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Eye, FileText } from "lucide-react";
import type { LibraryItem } from "@/lib/types";

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

interface SystemFeatureCardProps {
  item: LibraryItem;
}

export function SystemFeatureCard({ item }: SystemFeatureCardProps) {
  const typography = item.manifest?.typography;
  const fontLabel = typography
    ? [typography.sans, typography.mono].filter(Boolean).join(" \u00B7 ")
    : null;

  return (
    <motion.div variants={cardVariant} className="col-span-1 md:col-span-2">
      <Link to={`/systems/${item.slug}`} className="block">
        <motion.div
          whileHover={{ y: -2, borderColor: "#2A2A2A" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-shell-raised border border-shell-border rounded-lg p-5 h-full card-glow"
        >
          {/* Top row */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-shell-text-primary">
              {item.name}
            </h3>
            {item.manifest?.version && (
              <span className="text-xs text-shell-text-tertiary bg-shell-popover px-1.5 py-0.5 rounded">
                v{item.manifest.version}
              </span>
            )}
            {item.accentColor && (
              <span
                className="inline-block w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: item.accentColor }}
              />
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-shell-text-secondary line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          {/* Bottom row */}
          <div className="flex items-center gap-2 flex-wrap">
            {fontLabel && (
              <span className="text-xs text-shell-text-secondary">
                {fontLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-shell-text-tertiary">
              <FileText className="w-3 h-3" />
              {item.fileCount}
            </span>
            {item.hasPreview && (
              <span className="inline-flex items-center gap-1 text-xs text-shell-text-tertiary bg-shell-popover px-1.5 py-0.5 rounded">
                <Eye className="w-3 h-3" />
                Preview
              </span>
            )}
            {item.familyPrefix && (
              <span className="text-xs text-shell-text-tertiary bg-shell-popover px-1.5 py-0.5 rounded ml-auto">
                {item.familyPrefix}
              </span>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
