import { useState, useEffect } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getAssetPath } from "@/lib/files";

interface PreviewTabProps {
  previewPath: string; // relative path like "systems/forge/preview/index.html"
}

export default function PreviewTab({ previewPath }: PreviewTabProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssetPath(previewPath)
      .then((absolutePath) => {
        setSrc(convertFileSrc(absolutePath));
      })
      .catch((e) => setError(String(e)));
  }, [previewPath]);

  if (error) {
    return <div className="text-red-400 text-sm">Failed to load preview: {error}</div>;
  }

  if (!src) {
    return <div className="text-shell-text-secondary text-sm">Loading preview...</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-200px)] min-h-[500px]">
      <iframe
        src={src}
        title="System Preview"
        className="w-full h-full rounded-lg border border-shell-border bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
