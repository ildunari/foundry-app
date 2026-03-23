import type { LibraryItem } from "@/lib/types";
import { useLibrary } from "@/context/LibraryContext";
import CopyButton from "@/components/shared/CopyButton";

interface OverviewTabProps {
  item: LibraryItem;
}

export default function OverviewTab({ item }: OverviewTabProps) {
  const { index } = useLibrary();
  const manifest = item.manifest;

  // Find related items by family prefix
  const relatedItems: LibraryItem[] = [];
  if (item.familyPrefix && index) {
    for (const cat of index.categories) {
      for (const other of cat.items) {
        if (
          other.slug !== item.slug &&
          other.familyPrefix === item.familyPrefix
        ) {
          relatedItems.push(other);
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-semibold">{item.name}</h1>
          {manifest?.version && (
            <span className="text-xs bg-shell-raised border border-shell-border rounded px-2 py-0.5 text-shell-text-secondary">
              v{manifest.version}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-shell-text-secondary text-lg">{item.description}</p>
        )}
      </div>

      {/* Accent Color */}
      {manifest?.palette?.accent && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
            Accent Color
          </h2>
          <CopyButton text={manifest.palette.accent} className="group">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border border-shell-border transition-transform duration-200 group-hover:scale-[1.08]"
                style={{ backgroundColor: manifest.palette.accent }}
              />
              <span className="text-sm font-mono text-shell-text-secondary">
                {manifest.palette.accent}
              </span>
            </div>
          </CopyButton>
        </div>
      )}

      {/* Heritage */}
      {manifest?.heritage && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
            Heritage
          </h2>
          <div className="flex flex-wrap gap-2">
            {manifest.heritage.parents.map((parent) => (
              <span
                key={parent}
                className="text-xs bg-shell-raised border border-shell-border rounded-full px-3 py-1 text-shell-text-secondary"
              >
                {parent}
              </span>
            ))}
            {manifest.heritage.fonts.map((font) => (
              <span
                key={font}
                className="text-xs bg-shell-raised border border-shell-border rounded-full px-3 py-1 text-shell-text-tertiary"
              >
                {font}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Font Stack */}
      {manifest?.typography && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
            Font Stack
          </h2>
          <div className="space-y-3">
            {[
              { label: "Sans", value: manifest.typography.sans },
              { label: "Mono", value: manifest.typography.mono },
              ...(manifest.typography.pixel
                ? [{ label: "Pixel", value: manifest.typography.pixel }]
                : []),
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-baseline gap-4 bg-shell-raised border border-shell-border rounded-lg px-4 py-3"
              >
                <span className="text-xs text-shell-text-tertiary uppercase w-12 shrink-0">
                  {label}
                </span>
                <span className="text-sm text-shell-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Targets */}
      {manifest && manifest.targets.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
            Targets
          </h2>
          <div className="flex flex-wrap gap-2">
            {manifest.targets.map((target) => (
              <span
                key={target}
                className="text-xs bg-shell-raised border border-shell-border rounded px-2.5 py-1 text-shell-text-secondary"
              >
                {target}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
            Related Items
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {relatedItems.map((related) => (
              <div
                key={related.slug}
                className="bg-shell-raised border border-shell-border rounded-lg px-4 py-3"
              >
                <div className="text-sm text-shell-text-primary">{related.name}</div>
                <div className="text-xs text-shell-text-tertiary">{related.categoryKind}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
