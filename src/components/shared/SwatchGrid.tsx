import CopyButton from "./CopyButton";

interface ColorSwatch {
  name: string;
  value: string;
}

interface SwatchGridProps {
  colors: ColorSwatch[];
  columns?: number;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export default function SwatchGrid({ colors, columns = 5 }: SwatchGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {colors.map((swatch) => (
        <CopyButton key={swatch.name} text={swatch.value} className="group text-left">
          <div className="w-full">
            <div
              className="w-full aspect-square rounded-lg border border-shell-border transition-transform duration-200 group-hover:scale-[1.08]"
              style={{ backgroundColor: swatch.value }}
            />
            <div className="mt-1.5">
              <div className="text-xs text-shell-text-secondary truncate">{swatch.name}</div>
              <div className="text-[10px] text-shell-text-tertiary font-mono">
                {swatch.value}
              </div>
            </div>
          </div>
        </CopyButton>
      ))}
    </div>
  );
}

export { isLightColor };
export type { ColorSwatch };
