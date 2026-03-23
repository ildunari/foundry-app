import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import type { LibraryItem } from "@/lib/types";

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

interface ItemCardProps {
  item: LibraryItem;
  categoryLabel: string;
}

export function ItemCard({ item, categoryLabel }: ItemCardProps) {
  return (
    <motion.div variants={cardVariant} className="col-span-1">
      <Link to={`/${item.categoryKind}/${item.slug}`} className="block">
        <motion.div
          whileHover={{ y: -2, borderColor: "#2A2A2A" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="bg-shell-raised border border-shell-border rounded-lg p-4 h-full card-glow"
        >
          {/* Category badge */}
          <span className="text-xs uppercase tracking-wide text-shell-text-tertiary">
            {categoryLabel}
          </span>

          {/* Item name */}
          <h3 className="font-medium text-shell-text-primary mt-1">
            {item.name}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-shell-text-secondary line-clamp-2 mt-1">
              {item.description}
            </p>
          )}

          {/* Bottom row */}
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs text-shell-text-tertiary">
              <FileText className="w-3 h-3" />
              {item.fileCount}
            </span>
            {item.status === "spec-only" && (
              <span className="text-xs text-amber-500">Spec only</span>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
