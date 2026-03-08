import { AppIcons } from "@/constants/icons";
import { RECORD_TYPE_COLORS, RECORD_TYPE_BG_COLORS } from "@/constants/ui";
import { cn } from "@/lib/utils";
import { Hexagon } from "@/components/ui/hexagon";
import { type LucideIcon } from "lucide-react";

export type RecordType = 'feeding' | 'sleep' | 'diaper' | 'note' | 'growth' | 'contraction';

interface RecordIconProps {
  type: RecordType;
  className?: string;
  icon?: LucideIcon;
}

export function RecordIcon({ type, className, icon: OverrideIcon }: RecordIconProps) {
  const Icon = OverrideIcon ?? AppIcons[type];
  const bg = RECORD_TYPE_BG_COLORS[type] || 'text-gray-100 dark:text-zinc-800';
  const iconColor = RECORD_TYPE_COLORS[type as keyof typeof RECORD_TYPE_COLORS] || 'text-muted-foreground';

  if (!Icon) return null;

  return (
    <Hexagon
      size={36}
      cornerRadius={6}
      className={cn("shrink-0", bg, className)}
    >
      <Icon className={cn("w-4 h-4", iconColor)} />
    </Hexagon>
  );
}
