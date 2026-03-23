import { useState, useEffect } from "react";
import { readFile } from "@/lib/files";

export function useFileContent(path: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setContent(null);
      return;
    }
    setLoading(true);
    setError(null);
    readFile(path)
      .then(setContent)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [path]);

  return { content, loading, error };
}
