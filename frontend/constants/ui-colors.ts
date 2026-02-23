export const UI_COLORS = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-500",
    iconDark: "dark:text-rose-400",
    title: "text-rose-700 dark:text-rose-300",
    item: "text-rose-800 dark:text-rose-200",
    trigger: "hover:bg-rose-100/50 dark:hover:bg-rose-900/20",
    accent: "bg-rose-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-500",
    iconDark: "dark:text-indigo-400",
    title: "text-indigo-700 dark:text-indigo-300",
    item: "text-indigo-800 dark:text-indigo-200",
    trigger: "hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20",
    accent: "bg-indigo-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-500",
    iconDark: "dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-300",
    item: "text-amber-800 dark:text-amber-200",
    trigger: "hover:bg-amber-100/50 dark:hover:bg-amber-900/20",
    accent: "bg-amber-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-500",
    iconDark: "dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
    item: "text-emerald-800 dark:text-emerald-200",
    trigger: "hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20",
    accent: "bg-emerald-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-500",
    iconDark: "dark:text-red-400",
    title: "text-red-700 dark:text-red-300",
    item: "text-red-800 dark:text-red-200",
    trigger: "hover:bg-red-100/50 dark:hover:bg-red-900/20",
    accent: "bg-red-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-500",
    iconDark: "dark:text-purple-400",
    title: "text-purple-700 dark:text-purple-300",
    item: "text-purple-800 dark:text-purple-200",
    trigger: "hover:bg-purple-100/50 dark:hover:bg-purple-900/20",
    accent: "bg-purple-400",
  },
  slate: {
    bg: "bg-slate-50 dark:bg-slate-900/30",
    border: "border-slate-200 dark:border-slate-700",
    icon: "text-slate-500",
    iconDark: "dark:text-slate-400",
    title: "text-slate-700 dark:text-slate-300",
    item: "text-slate-700 dark:text-slate-300",
    trigger: "hover:bg-slate-100/50 dark:hover:bg-slate-800/20",
    accent: "bg-slate-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-500",
    iconDark: "dark:text-blue-400",
    title: "text-blue-700 dark:text-blue-300",
    item: "text-blue-800 dark:text-blue-200",
    trigger: "hover:bg-blue-100/50 dark:hover:bg-blue-900/20",
    accent: "bg-blue-400",
  },
  zinc: {
    bg: "bg-zinc-50 dark:bg-zinc-900/50",
    border: "border-zinc-200 dark:border-zinc-700",
    icon: "text-zinc-500",
    iconDark: "dark:text-zinc-400",
    title: "text-zinc-700 dark:text-zinc-300",
    item: "text-zinc-700 dark:text-zinc-300",
    trigger: "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20",
    accent: "bg-zinc-400",
  },
} as const;

export const UI_BUTTONS = {
  primary: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white",
} as const;

export const UI_FORMS = {
  timer: {
    rose: {
      container: "bg-rose-50 dark:bg-rose-950/30",
      title: "text-rose-700 dark:text-rose-300",
      timer: "text-rose-600 dark:text-rose-400",
      buttonActive: "bg-white dark:bg-zinc-900 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50",
      buttonInactive: "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white",
      totalText: "text-rose-600 dark:text-rose-400",
    },
  },
  selection: {
    amberBordered: {
      active: "border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
      inactive: "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-200 dark:hover:border-amber-900",
    },
    blueSolid: {
        active: "bg-blue-500 text-white border-blue-500",
        inactive: "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-blue-300",
    },
    greenSolid: {
        active: "bg-green-500 text-white border-green-500",
        inactive: "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-300",
    },
    amberSolid: {
        active: "bg-amber-500 text-white border-amber-500",
        inactive: "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-300",
    }
  },
} as const;

export const TIPS_CARD_CONFIG = {
  rose: {
    border: UI_COLORS.rose.border,
    bg: UI_COLORS.rose.bg,
    accent: UI_COLORS.rose.accent,
    icon: UI_COLORS.rose.icon,
    title: UI_COLORS.rose.title,
    item: UI_COLORS.rose.item,
    trigger: UI_COLORS.rose.trigger,
  },
  indigo: {
    border: UI_COLORS.indigo.border,
    bg: UI_COLORS.indigo.bg,
    accent: UI_COLORS.indigo.accent,
    icon: UI_COLORS.indigo.icon,
    title: UI_COLORS.indigo.title,
    item: UI_COLORS.indigo.item,
    trigger: UI_COLORS.indigo.trigger,
  },
  amber: {
    border: UI_COLORS.amber.border,
    bg: UI_COLORS.amber.bg,
    accent: UI_COLORS.amber.accent,
    icon: UI_COLORS.amber.icon,
    title: UI_COLORS.amber.title,
    item: UI_COLORS.amber.item,
    trigger: UI_COLORS.amber.trigger,
  },
  emerald: {
    border: UI_COLORS.emerald.border,
    bg: UI_COLORS.emerald.bg,
    accent: UI_COLORS.emerald.accent,
    icon: UI_COLORS.emerald.icon,
    title: UI_COLORS.emerald.title,
    item: UI_COLORS.emerald.item,
    trigger: UI_COLORS.emerald.trigger,
  },
  red: {
    border: UI_COLORS.red.border,
    bg: UI_COLORS.red.bg,
    accent: UI_COLORS.red.accent,
    icon: UI_COLORS.red.icon,
    title: UI_COLORS.red.title,
    item: UI_COLORS.red.item,
    trigger: UI_COLORS.red.trigger,
  },
  purple: {
    border: UI_COLORS.purple.border,
    bg: UI_COLORS.purple.bg,
    accent: UI_COLORS.purple.accent,
    icon: UI_COLORS.purple.icon,
    title: UI_COLORS.purple.title,
    item: UI_COLORS.purple.item,
    trigger: UI_COLORS.purple.trigger,
  },
  slate: {
    border: UI_COLORS.slate.border,
    bg: UI_COLORS.slate.bg,
    accent: UI_COLORS.slate.accent,
    icon: UI_COLORS.slate.icon,
    title: UI_COLORS.slate.title,
    item: UI_COLORS.slate.item,
    trigger: UI_COLORS.slate.trigger,
  },
} as const;

export const STATS_BLOCK_CONFIG = {
  rose: {
    bg: UI_COLORS.rose.bg,
    icon: `${UI_COLORS.rose.icon} ${UI_COLORS.rose.iconDark}`,
  },
  indigo: {
    bg: UI_COLORS.indigo.bg,
    icon: `${UI_COLORS.indigo.icon} ${UI_COLORS.indigo.iconDark}`,
  },
  amber: {
    bg: UI_COLORS.amber.bg,
    icon: `${UI_COLORS.amber.icon} ${UI_COLORS.amber.iconDark}`,
  },
  emerald: {
    bg: UI_COLORS.emerald.bg,
    icon: `${UI_COLORS.emerald.icon} ${UI_COLORS.emerald.iconDark}`,
  },
  blue: {
    bg: UI_COLORS.blue.bg,
    icon: `${UI_COLORS.blue.icon} ${UI_COLORS.blue.iconDark}`,
  },
  zinc: {
    bg: UI_COLORS.zinc.bg,
    icon: `${UI_COLORS.zinc.icon} ${UI_COLORS.zinc.iconDark}`,
  },
} as const;
