import { Building2, Type, Shapes, Zap, Palette, Grid3x3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CategoryKind } from "@/lib/types";

export interface CategoryDef {
  kind: CategoryKind;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const CATEGORY_ICONS: Record<CategoryKind, LucideIcon> = {
  systems: Building2,
  typography: Type,
  iconography: Shapes,
  motion: Zap,
  palettes: Palette,
  patterns: Grid3x3,
};

export const CATEGORIES: CategoryDef[] = [
  { kind: "systems", label: "Systems", icon: Building2, path: "/systems" },
  { kind: "typography", label: "Typography", icon: Type, path: "/typography" },
  { kind: "iconography", label: "Iconography", icon: Shapes, path: "/iconography" },
  { kind: "motion", label: "Motion", icon: Zap, path: "/motion" },
  { kind: "palettes", label: "Palettes", icon: Palette, path: "/palettes" },
  { kind: "patterns", label: "Patterns", icon: Grid3x3, path: "/patterns" },
];
