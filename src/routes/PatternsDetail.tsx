import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useLibrary } from "@/context/LibraryContext";
import { listFiles } from "@/lib/files";
import type { LibraryItem } from "@/lib/types";

const VIEWPORTS = [
  { label: "320", width: 320 },
  { label: "768", width: 768 },
  { label: "1024", width: 1024 },
  { label: "Full", width: 0 },
] as const;

interface PatternFile {
  name: string;
  path: string;
  src: string;
}

export default function PatternsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { index, isLoading } = useLibrary();

  const [htmlFiles, setHtmlFiles] = useState<PatternFile[]>([]);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [viewportWidths, setViewportWidths] = useState<Record<string, number>>({});

  const item = useMemo<LibraryItem | undefined>(() => {
    if (!index) return undefined;
    for (const cat of index.categories) {
      if (cat.kind !== "patterns") continue;
      return cat.items.find((i) => i.slug === slug);
    }
    return undefined;
  }, [index, slug]);

  useEffect(() => {
    if (!index || !item) return;

    const basePath = `${index.libraryPath}/patterns/${item.slug}`;

    listFiles(basePath)
      .then((files) => {
        const html = files
          .filter((f) => f.endsWith(".html") || f.endsWith(".htm"))
          .map((filePath) => {
            const name = filePath.split("/").pop() ?? filePath;
            return {
              name,
              path: filePath,
              src: convertFileSrc(filePath),
            };
          });
        setHtmlFiles(html);
      })
      .catch(() => {
        setHtmlFiles([]);
      });
  }, [index, item]);

  function getViewportWidth(fileName: string): number {
    return viewportWidths[fileName] ?? 0;
  }

  function setViewport(fileName: string, width: number) {
    setViewportWidths((prev) => ({ ...prev, [fileName]: width }));
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
        <p className="text-shell-text-secondary">Pattern not found.</p>
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
        <p className="text-shell-text-secondary mb-8">{item.description}</p>
      )}

      {htmlFiles.length === 0 && (
        <div className="bg-shell-raised border border-shell-border rounded-lg p-6 text-sm text-shell-text-tertiary">
          {item.readmeExcerpt ? (
            <pre className="whitespace-pre-wrap font-sans">{item.readmeExcerpt}</pre>
          ) : (
            "No HTML pattern files found in this directory."
          )}
        </div>
      )}

      {/* Expanded full preview */}
      <AnimatePresence>
        {expandedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-shell-bg/95 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-shell-border">
              <span className="text-sm text-shell-text-primary font-medium">
                {expandedFile}
              </span>
              <button
                type="button"
                onClick={() => setExpandedFile(null)}
                className="p-1.5 rounded text-shell-text-tertiary hover:text-shell-text-secondary transition-colors"
              >
                <Minimize2 size={16} />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={htmlFiles.find((f) => f.name === expandedFile)?.src}
                title={expandedFile}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pattern cards */}
      <div className="space-y-6">
        {htmlFiles.map((file) => {
          const vw = getViewportWidth(file.name);
          return (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-shell-raised border border-shell-border rounded-lg overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-shell-border">
                <span className="text-sm text-shell-text-primary font-medium">
                  {file.name}
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Viewport controls */}
                  {VIEWPORTS.map((vp) => (
                    <button
                      key={vp.label}
                      type="button"
                      onClick={() => setViewport(file.name, vp.width)}
                      className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                        vw === vp.width
                          ? "bg-shell-bg text-shell-text-primary"
                          : "text-shell-text-tertiary hover:text-shell-text-secondary"
                      }`}
                    >
                      {vp.label}
                    </button>
                  ))}
                  {/* Expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedFile(file.name)}
                    className="ml-2 p-1 rounded text-shell-text-tertiary hover:text-shell-text-secondary transition-colors"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div
                className="bg-white flex justify-center"
                style={{ minHeight: 300 }}
              >
                <iframe
                  src={file.src}
                  title={file.name}
                  loading="lazy"
                  sandbox="allow-scripts"
                  className="border-0 h-[300px] bg-white"
                  style={{
                    width: vw === 0 ? "100%" : `${vw}px`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
