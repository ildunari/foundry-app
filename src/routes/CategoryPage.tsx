import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useLibrary } from "@/context/LibraryContext";
import { CATEGORIES } from "@/lib/constants";
import type { CategoryKind } from "@/lib/types";

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

export default function CategoryPage({ kind }: { kind: CategoryKind }) {
  const { index, isLoading } = useLibrary();
  const def = CATEGORIES.find((c) => c.kind === kind)!;
  const Icon = def.icon;

  const category = index?.categories.find((c) => c.kind === kind);
  const items = category?.items ?? [];

  if (isLoading) {
    return (
      <div className="text-shell-text-secondary animate-pulse">
        Scanning library...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Icon size={20} className="text-shell-text-secondary" />
        <h1 className="text-2xl font-semibold">{def.label}</h1>
        <span className="text-xs bg-shell-raised border border-shell-border rounded-full px-2.5 py-0.5 text-shell-text-secondary">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Icon
            size={64}
            className="text-shell-text-primary opacity-20 mb-4"
          />
          <p className="text-shell-text-secondary">
            No {def.label.toLowerCase()} items yet.
          </p>
          <p className="text-xs text-shell-text-tertiary mt-1">
            Use the AI panel to create one.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {items.map((item) => (
            <motion.div key={item.slug} variants={cardVariant}>
              <Link
                to={`/${kind}/${item.slug}`}
                className="block bg-shell-raised border border-shell-border rounded-lg p-4 transition-all duration-150 hover:border-[#2A2A2A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{item.name}</span>
                  {item.accentColor && (
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.accentColor }}
                    />
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-shell-text-secondary line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {item.status === "spec-only" && (
                    <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-800/30 rounded px-1.5 py-0.5">
                      Spec only
                    </span>
                  )}
                  <span className="text-xs text-shell-text-tertiary">
                    {item.fileCount} files
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
