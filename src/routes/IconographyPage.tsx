import { Link } from "react-router-dom";
import { Shapes } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";

export default function IconographyPage() {
  const { index, isLoading } = useLibrary();

  const category = index?.categories.find((c) => c.kind === "iconography");
  const items = category?.items ?? [];

  if (isLoading) {
    return <div className="text-shell-text-secondary">Scanning library...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Iconography</h1>
        <span className="text-xs bg-shell-raised border border-shell-border rounded-full px-2.5 py-0.5 text-shell-text-secondary">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Shapes size={64} className="text-shell-text-primary opacity-20 mb-4" />
          <p className="text-shell-text-secondary">No iconography items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              to={`/iconography/${item.slug}`}
              className="bg-shell-raised border border-shell-border rounded-lg p-4 hover:border-shell-text-tertiary transition-colors"
            >
              <div className="font-medium mb-1">{item.name}</div>
              {item.description && (
                <p className="text-sm text-shell-text-secondary line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                {item.status === "spec-only" && (
                  <span className="text-xs bg-shell-popover border border-shell-border rounded px-1.5 py-0.5 text-shell-text-tertiary">
                    spec-only
                  </span>
                )}
                <span className="text-xs text-shell-text-tertiary">
                  {item.fileCount} files
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
