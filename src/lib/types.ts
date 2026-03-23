export type CategoryKind =
  | "systems"
  | "typography"
  | "iconography"
  | "motion"
  | "palettes"
  | "patterns";

export interface LibraryIndex {
  scannedAt: string;
  libraryPath: string;
  categories: CategorySummary[];
}

export interface CategorySummary {
  kind: CategoryKind;
  label: string;
  items: LibraryItem[];
  isEmpty: boolean;
}

export interface LibraryItem {
  slug: string;
  name: string;
  description: string;
  categoryKind: CategoryKind;
  familyPrefix: string | null;
  status: ItemStatus;
  accentColor: string | null;
  lastModified: string;
  manifest: ManifestData | null;
  readmeExcerpt: string | null;
  fileCount: number;
  hasPreview: boolean;
}

export type ItemStatus = "complete" | "spec-only" | "empty";

export interface ManifestData {
  name: string;
  version: string;
  description: string;
  created: string | null;
  heritage: {
    parents: string[];
    fonts: string[];
    fontSource: string;
    license: string;
  } | null;
  palette: {
    mode: string;
    accent: string;
    darkBackground: string;
    lightBackground: string;
    grayUndertone: string;
  } | null;
  typography: {
    sans: string;
    mono: string;
    pixel: string | null;
    scaleRatio: number;
  } | null;
  structure: {
    preview: string | null;
    components: string[];
    tokens: Record<string, string>;
    docs: string[];
  } | null;
  targets: string[];
}
