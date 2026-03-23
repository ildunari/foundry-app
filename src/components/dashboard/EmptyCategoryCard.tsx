import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

interface EmptyCategoryCardProps {
  label: string;
  icon: LucideIcon;
}

export function EmptyCategoryCard({
  label,
  icon: Icon,
}: EmptyCategoryCardProps) {
  return (
    <motion.div variants={cardVariant} className="col-span-1">
      <div className="bg-shell-raised/50 border border-dashed border-shell-border rounded-lg p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px]">
        <Icon className="w-8 h-8 text-shell-text-tertiary opacity-20 mb-2" />
        <span className="text-sm text-shell-text-tertiary">{label}</span>
        <span className="text-xs text-shell-text-tertiary mt-0.5">
          No items yet
        </span>
      </div>
    </motion.div>
  );
}
