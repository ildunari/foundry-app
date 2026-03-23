import { useLibrary } from "@/context/LibraryContext";
import { BentoGrid } from "@/components/dashboard/BentoGrid";
import { SystemFeatureCard } from "@/components/dashboard/SystemFeatureCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { EmptyCategoryCard } from "@/components/dashboard/EmptyCategoryCard";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { ReactNode } from "react";

export default function Dashboard() {
  const { index, isLoading, error } = useLibrary();

  if (isLoading || !index) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-shell-text-secondary animate-pulse">
          Scanning library...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  const cards: ReactNode[] = [];

  // Find the systems category
  const systemsCategory = index.categories.find((c) => c.kind === "systems");
  const otherCategories = index.categories.filter((c) => c.kind !== "systems");

  // 1. Feature cards for "complete" systems, sorted by lastModified desc
  const completeSystems = (systemsCategory?.items ?? [])
    .filter((item) => item.status === "complete")
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() -
        new Date(a.lastModified).getTime(),
    );

  for (const item of completeSystems) {
    cards.push(<SystemFeatureCard key={`system-${item.slug}`} item={item} />);
  }

  // 2. Standard cards for "spec-only" systems
  const specOnlySystems = (systemsCategory?.items ?? []).filter(
    (item) => item.status === "spec-only",
  );

  for (const item of specOnlySystems) {
    cards.push(
      <ItemCard
        key={`system-spec-${item.slug}`}
        item={item}
        categoryLabel="Systems"
      />,
    );
  }

  // 3. Item cards for non-empty non-system categories
  for (const cat of otherCategories) {
    if (cat.isEmpty) continue;
    for (const item of cat.items) {
      cards.push(
        <ItemCard
          key={`${cat.kind}-${item.slug}`}
          item={item}
          categoryLabel={cat.label}
        />,
      );
    }
  }

  // 4. Empty category cards
  // Include systems if it is empty too
  for (const cat of index.categories) {
    if (!cat.isEmpty) continue;
    cards.push(
      <EmptyCategoryCard
        key={`empty-${cat.kind}`}
        label={cat.label}
        icon={CATEGORY_ICONS[cat.kind]}
      />,
    );
  }

  return <BentoGrid>{cards}</BentoGrid>;
}
