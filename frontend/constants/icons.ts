import {
  Milk,
  Moon,
  Baby,
  Ruler,
  StickyNote,
  Timer,
  BookOpen,
  Syringe,
  Trophy,
  Smile,
  Droplets,
  Biohazard,
  HandHeart,
  Bed,
  type LucideIcon,
} from "lucide-react";
import { RECORD_TYPES } from "@/types/enums";

/**
 * アプリケーション全体で統一して使用するアイコンの定義
 *
 * 異なる箇所で異なるアイコンが使われるのを防ぐため、
 * 機能やレコード種類に対応するアイコンはすべてここで定義し、インポートして使用する。
 */
export const AppIcons = {
  // レコード・機能ごとのメインアイコン
  feeding: Milk, // 授乳
  sleep: Moon, // 睡眠
  diaper: Smile, // おむつ (実際の赤ちゃんと区別するためSmileを採用)
  growth: Ruler, // 成長
  note: StickyNote, // メモ
  contraction: Timer, // 陣痛
  diary: BookOpen, // 日誌
  vaccination: Syringe, // 予防接種
  milestone: Trophy, // マイルストーン

  // 状態やサブアクションのアイコン
  baby: Baby, // 赤ちゃん（プロフィール等）
  sleepActive: Bed, // 睡眠中
  feedingBreast: HandHeart, // 母乳
  feedingBottle: Milk, // ミルク
  diaperWet: Droplets, // おしっこ
  diaperDirty: Biohazard, // うんち
} as const;

export type AppIconType = keyof typeof AppIcons;

/**
 * レコードタイプとアイコンの直接マッピング
 */
export const RECORD_TYPE_ICONS: Record<string, LucideIcon> = {
  [RECORD_TYPES.FEEDING]: AppIcons.feeding,
  [RECORD_TYPES.SLEEP]: AppIcons.sleep,
  [RECORD_TYPES.DIAPER]: AppIcons.diaper,
  [RECORD_TYPES.GROWTH]: AppIcons.growth,
  [RECORD_TYPES.NOTE]: AppIcons.note,
  [RECORD_TYPES.CONTRACTION]: AppIcons.contraction,
};
