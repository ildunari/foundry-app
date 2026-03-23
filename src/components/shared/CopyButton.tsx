import { useState, useCallback } from "react";
import type { ReactNode } from "react";

interface CopyButtonProps {
  text: string;
  children: ReactNode;
  className?: string;
}

export default function CopyButton({ text, children, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center transition-all duration-200 ${className}`}
    >
      <span
        className={`transition-opacity duration-200 ${copied ? "opacity-0 absolute" : "opacity-100"}`}
      >
        {children}
      </span>
      <span
        className={`transition-opacity duration-200 text-green-400 text-xs ${copied ? "opacity-100" : "opacity-0 absolute"}`}
      >
        &#10003; Copied!
      </span>
    </button>
  );
}
