/**
 * Pencil Bridge — convert between Foundry Design_Library format and Pencil .pen format.
 *
 * Foundry format: manifest.json + tokens/*.json + components/*.css + preview/*.html
 * Pencil format: .pen JSON with nodes (frame, text, ref), variables, themes
 */

import type { ManifestData } from "./types";

/** Pencil variable definition with optional theme variants */
interface PenVariable {
  [key: string]: string | Record<string, string>;
}

/** Pencil node in .pen file */
interface PenNode {
  id?: string;
  type: "frame" | "text" | "rectangle" | "ref";
  name?: string;
  reusable?: boolean;
  layout?: "vertical" | "horizontal";
  width?: number | string;
  height?: number | string;
  padding?: number | number[];
  gap?: number;
  fill?: string;
  stroke?: { fill: string; thickness: number };
  cornerRadius?: number | number[];
  children?: PenNode[];
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
}

/** Convert a Foundry token JSON to Pencil variables */
export function tokensToPencilVariables(
  tokens: Record<string, unknown>,
): Record<string, PenVariable> {
  const variables: Record<string, PenVariable> = {};

  function walk(obj: Record<string, unknown>, prefix: string) {
    for (const [key, val] of Object.entries(obj)) {
      const varName = prefix ? `${prefix}-${key}` : key;

      if (val && typeof val === "object" && !Array.isArray(val)) {
        const record = val as Record<string, unknown>;
        // Check if it's a leaf token (has $value, value, dark/light)
        if ("$value" in record) {
          variables[`$--${varName}`] = { default: String(record.$value) };
        } else if ("value" in record) {
          variables[`$--${varName}`] = { default: String(record.value) };
        } else if ("dark" in record && "light" in record) {
          variables[`$--${varName}`] = {
            dark: String(record.dark),
            light: String(record.light),
          };
        } else {
          walk(record, varName);
        }
      }
    }
  }

  walk(tokens, "");
  return variables;
}

/** Convert Pencil variables back to Foundry token JSON */
export function pencilVariablesToTokens(
  variables: Record<string, PenVariable>,
): Record<string, unknown> {
  const tokens: Record<string, unknown> = {};

  for (const [varName, value] of Object.entries(variables)) {
    const path = varName
      .replace(/^\$--/, "")
      .split("-");

    let current = tokens;
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {};
      }
      current = current[path[i]] as Record<string, unknown>;
    }

    const leaf = path[path.length - 1];
    if (typeof value === "string") {
      current[leaf] = { $value: value };
    } else if ("dark" in value && "light" in value) {
      current[leaf] = { dark: value.dark, light: value.light };
    } else if ("default" in value) {
      current[leaf] = { $value: value.default };
    }
  }

  return tokens;
}

/** Generate a basic Pencil component node from a Foundry manifest */
export function manifestToPenComponentStub(manifest: ManifestData): PenNode {
  const accent = manifest.palette?.accent ?? "#D15010";
  const sans = manifest.typography?.sans ?? "Inter";
  const mono = manifest.typography?.mono ?? "monospace";

  return {
    type: "frame",
    name: `${manifest.palette?.mode ?? "default"} Design System`,
    reusable: false,
    layout: "vertical",
    width: 800,
    gap: 24,
    padding: 32,
    fill: manifest.palette?.darkBackground ?? "#0C0C0C",
    children: [
      {
        type: "text",
        content: "Design System Preview",
        fontSize: 24,
        fontFamily: sans,
        fontWeight: 600,
        fill: "#EEEEEE",
      },
      {
        type: "frame",
        name: "Color Swatches",
        layout: "horizontal",
        gap: 8,
        children: [
          { type: "rectangle", name: "Background", width: 48, height: 48, fill: manifest.palette?.darkBackground ?? "#020202", cornerRadius: 4 },
          { type: "rectangle", name: "Accent", width: 48, height: 48, fill: accent, cornerRadius: 4 },
          { type: "rectangle", name: "Light BG", width: 48, height: 48, fill: manifest.palette?.lightBackground ?? "#FAFAFA", cornerRadius: 4 },
        ],
      },
      {
        type: "frame",
        name: "Typography Sample",
        layout: "vertical",
        gap: 8,
        children: [
          { type: "text", content: `Sans: ${sans}`, fontSize: 16, fontFamily: sans, fill: "#EEEEEE" },
          { type: "text", content: `Mono: ${mono}`, fontSize: 14, fontFamily: mono, fill: "#A0A0A0" },
        ],
      },
    ],
  };
}

/** Export manifest + tokens as a .pen-compatible JSON string */
export function exportAsPen(
  manifest: ManifestData,
  tokens: Record<string, unknown>,
): string {
  const variables = tokensToPencilVariables(tokens);
  const rootNode = manifestToPenComponentStub(manifest);

  return JSON.stringify(
    {
      format: "pen",
      version: "1.0",
      variables,
      nodes: [rootNode],
    },
    null,
    2,
  );
}
