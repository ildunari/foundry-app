import { useState, useEffect } from "react";
import { useFileContent } from "@/hooks/useFileContent";
import { getAssetPath } from "@/lib/files";
import { convertFileSrc } from "@tauri-apps/api/core";

interface ComponentTabProps {
  cssPath: string; // relative path like "systems/forge/components/buttons.css"
  systemSlug: string;
}

export default function ComponentTab({ cssPath, systemSlug }: ComponentTabProps) {
  const [resolvedCssPath, setResolvedCssPath] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    getAssetPath(cssPath).then(setResolvedCssPath).catch(() => {});
  }, [cssPath]);

  // Resolve the preview HTML for iframe context
  useEffect(() => {
    getAssetPath(`systems/${systemSlug}/preview/index.html`)
      .then((absPath) => setPreviewSrc(convertFileSrc(absPath)))
      .catch(() => {});
  }, [systemSlug]);

  const { content, loading, error } = useFileContent(resolvedCssPath);

  if (loading) {
    return <div className="text-shell-text-secondary text-sm">Loading component CSS...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">Failed to load: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* CSS Code Block */}
      <div>
        <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
          Source CSS
        </h2>
        <div className="bg-shell-raised border border-shell-border rounded-lg overflow-hidden">
          <pre className="p-4 text-sm text-shell-text-secondary overflow-x-auto overflow-y-auto max-h-[500px]">
            <code className="font-mono text-xs leading-relaxed">{content}</code>
          </pre>
        </div>
      </div>

      {/* Preview (uses the system's full preview page as context) */}
      {previewSrc && (
        <div>
          <h2 className="text-sm font-medium text-shell-text-tertiary uppercase tracking-wider mb-3">
            Live Preview
          </h2>
          <iframe
            src={previewSrc}
            title="Component Preview"
            className="w-full h-[400px] rounded-lg border border-shell-border bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
