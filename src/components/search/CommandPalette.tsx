import { useMemo } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { LibraryItem, CategoryKind } from "@/lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem extends LibraryItem {
  categoryLabel: string;
}

const CATEGORY_LABELS: Record<CategoryKind, string> = {
  systems: "Systems",
  typography: "Typography",
  iconography: "Iconography",
  motion: "Motion",
  palettes: "Palettes",
  patterns: "Patterns",
};

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { index } = useLibrary();

  const grouped = useMemo(() => {
    if (!index) return new Map<CategoryKind, SearchItem[]>();

    const map = new Map<CategoryKind, SearchItem[]>();
    for (const cat of index.categories) {
      if (cat.items.length === 0) continue;
      map.set(
        cat.kind,
        cat.items.map((item) => ({
          ...item,
          categoryLabel: CATEGORY_LABELS[cat.kind],
        })),
      );
    }
    return map;
  }, [index]);

  function handleSelect(item: SearchItem) {
    onClose();
    navigate(`/${item.categoryKind}/${item.slug}`);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Command.Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
          label="Search library"
          className="fixed inset-0 z-50"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-[560px] z-50"
          >
            <div className="bg-shell-raised border border-shell-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-shell-border">
                <Search size={16} className="text-shell-text-tertiary flex-shrink-0" />
                <Command.Input
                  placeholder="Search design library..."
                  className="w-full h-12 bg-transparent text-sm text-shell-text-primary placeholder:text-shell-text-tertiary outline-none"
                />
                <kbd className="text-[10px] text-shell-text-tertiary bg-shell-bg border border-shell-border rounded px-1.5 py-0.5 flex-shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <Command.List className="max-h-[360px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-shell-text-tertiary">
                  No results found.
                </Command.Empty>

                {Array.from(grouped.entries()).map(([kind, items]) => {
                  const Icon = CATEGORY_ICONS[kind];
                  return (
                    <Command.Group
                      key={kind}
                      heading={CATEGORY_LABELS[kind]}
                      className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-shell-text-tertiary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                    >
                      {items.map((item) => (
                        <Command.Item
                          key={`${kind}-${item.slug}`}
                          value={`${item.name} ${item.description ?? ""} ${item.familyPrefix ?? ""}`}
                          onSelect={() => handleSelect(item)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-shell-text-secondary data-[selected=true]:bg-shell-bg data-[selected=true]:text-shell-text-primary transition-colors"
                        >
                          <Icon size={14} className="text-shell-text-tertiary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-shell-text-primary truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] bg-shell-bg border border-shell-border rounded px-1.5 py-0.5 text-shell-text-tertiary flex-shrink-0">
                                {item.categoryLabel}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-shell-text-tertiary truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                })}
              </Command.List>
            </div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
