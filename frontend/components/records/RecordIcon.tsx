import { Milk, Moon, Baby, StickyNote, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecordType = 'feeding' | 'sleep' | 'diaper' | 'note' | 'growth';

interface RecordIconProps {
  type: RecordType;
  className?: string;
}

const styles: Record<RecordType, string> = {
  feeding: "bg-orange-100 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400",
  sleep: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400",
  diaper: "bg-amber-100 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400",
  note: "bg-amber-100 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400",
  growth: "bg-green-100 dark:bg-green-950/40 text-green-500 dark:text-green-400",
};

const icons = {
  feeding: Milk,
  sleep: Moon,
  diaper: Baby,
  note: StickyNote,
  growth: Ruler,
};

export function RecordIcon({ type, className }: RecordIconProps) {
  const Icon = icons[type];
  const style = styles[type];

  if (!Icon) return null;

  return (
    <div className={cn("p-2 rounded-full", style, className)}>
      <Icon className="w-5 h-5" />
    </div>
  );
}
