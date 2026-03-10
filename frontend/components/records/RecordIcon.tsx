import { AppIcons } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { Hexagon } from "@/components/ui/hexagon";

export type RecordType = 'feeding' | 'sleep' | 'diaper' | 'note' | 'growth';

interface RecordIconProps {
  type: RecordType;
  className?: string;
}

const styles: Record<RecordType, { bg: string, icon: string }> = {
  feeding: { bg: "text-orange-100 dark:text-orange-950/40", icon: "text-orange-500 dark:text-orange-400" },
  sleep: { bg: "text-indigo-100 dark:text-indigo-950/40", icon: "text-indigo-500 dark:text-indigo-400" },
  diaper: { bg: "text-amber-100 dark:text-amber-950/40", icon: "text-amber-500 dark:text-amber-400" },
  note: { bg: "text-amber-100 dark:text-amber-950/40", icon: "text-amber-500 dark:text-amber-400" },
  growth: { bg: "text-green-100 dark:text-green-950/40", icon: "text-green-500 dark:text-green-400" },
};

export function RecordIcon({ type, className }: RecordIconProps) {
  const Icon = AppIcons[type];
  const style = styles[type];

  if (!Icon) return null;

  return (
    <Hexagon
      size={36}
      cornerRadius={6}
      className={cn("shrink-0", style.bg, className)}
    >
      <Icon className={cn("w-4 h-4", style.icon)} />
    </Hexagon>
  );
}
