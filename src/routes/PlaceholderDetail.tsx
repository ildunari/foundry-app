import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import type { LibraryItem } from "@/lib/types";

export default function PlaceholderDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { index, isLoading } = useLibrary();

  let item: LibraryItem | undefined;
  if (index) {
    for (const cat of index.categories) {
      const found = cat.items.find((i) => i.slug === slug);
      if (found) {
        item = found;
        break;
      }
    }
  }

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
        <p className="text-shell-text-secondary mb-6">{item.description}</p>
      )}

      {item.readmeExcerpt && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-2">
            Readme
          </h2>
          <pre className="bg-shell-raised border border-shell-border rounded-lg p-4 text-sm text-shell-text-secondary overflow-x-auto whitespace-pre-wrap">
            <code>{item.readmeExcerpt}</code>
          </pre>
        </div>
      )}

      <div className="bg-shell-raised border border-shell-border rounded-lg p-4 text-sm text-shell-text-tertiary">
        Full viewer coming in Phase 1
      </div>
    </div>
  );
}
