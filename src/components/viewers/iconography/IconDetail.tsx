import CopyButton from "@/components/shared/CopyButton";

interface IconDetailProps {
  iconName: string;
  sourceCode: string;
}

export default function IconDetail({ iconName, sourceCode }: IconDetailProps) {
  return (
    <div className="bg-shell-raised border border-shell-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-shell-text-primary font-mono">
          {iconName}
        </h3>
        <CopyButton
          text={sourceCode}
          className="text-xs text-shell-text-tertiary hover:text-shell-text-secondary px-2 py-1 rounded border border-shell-border hover:border-shell-text-tertiary transition-colors"
        >
          Copy Source
        </CopyButton>
      </div>

      <pre className="bg-shell-bg border border-shell-border rounded-md p-4 text-xs text-shell-text-secondary overflow-x-auto whitespace-pre font-mono leading-relaxed max-h-[400px] overflow-y-auto">
        <code>{sourceCode}</code>
      </pre>
    </div>
  );
}
