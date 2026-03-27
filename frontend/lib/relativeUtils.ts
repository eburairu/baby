import type { RelationshipType, Relative } from "@/types/relative"

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  father: "父",
  mother: "母",
  paternal_grandfather: "父方祖父",
  paternal_grandmother: "父方祖母",
  maternal_grandfather: "母方祖父",
  maternal_grandmother: "母方祖母",
  paternal_uncle: "父方叔父",
  paternal_aunt: "父方叔母",
  maternal_uncle: "母方叔父",
  maternal_aunt: "母方叔母",
  older_brother: "兄",
  older_sister: "姉",
  younger_brother: "弟",
  younger_sister: "妹",
}

/** 続柄グループ定義（表示レイアウト用） */
export type TreeRow = "grandparents" | "parents" | "siblings"

export interface TreeSlot {
  relationshipType: RelationshipType
  row: TreeRow
  col: number // グリッド列（1始まり）
  label: string
  multi: boolean // 複数登録可能か
}

/**
 * 家系図のレイアウト定義
 *
 * 行1（祖父母）: 父方祖父, 父方祖母, 母方祖父, 母方祖母
 * 行2（親 + 叔父叔母）: 父方叔父, 父方叔母, 父, 母, 母方叔父, 母方叔母
 * 行3（兄弟姉妹）: 兄, 姉, [赤ちゃん], 弟, 妹
 */
export const TREE_LAYOUT: TreeSlot[] = [
  // 祖父母行
  { relationshipType: "paternal_grandfather", row: "grandparents", col: 1, label: "父方祖父", multi: false },
  { relationshipType: "paternal_grandmother", row: "grandparents", col: 2, label: "父方祖母", multi: false },
  { relationshipType: "maternal_grandfather", row: "grandparents", col: 5, label: "母方祖父", multi: false },
  { relationshipType: "maternal_grandmother", row: "grandparents", col: 6, label: "母方祖母", multi: false },
  // 親・叔父叔母行
  { relationshipType: "paternal_uncle", row: "parents", col: 1, label: "父方叔父", multi: false },
  { relationshipType: "paternal_aunt", row: "parents", col: 2, label: "父方叔母", multi: false },
  { relationshipType: "father", row: "parents", col: 3, label: "父", multi: false },
  { relationshipType: "mother", row: "parents", col: 4, label: "母", multi: false },
  { relationshipType: "maternal_uncle", row: "parents", col: 5, label: "母方叔父", multi: false },
  { relationshipType: "maternal_aunt", row: "parents", col: 6, label: "母方叔母", multi: false },
  // 兄弟姉妹行
  { relationshipType: "older_brother", row: "siblings", col: 1, label: "兄", multi: true },
  { relationshipType: "older_sister", row: "siblings", col: 2, label: "姉", multi: true },
  { relationshipType: "younger_brother", row: "siblings", col: 5, label: "弟", multi: true },
  { relationshipType: "younger_sister", row: "siblings", col: 6, label: "妹", multi: true },
]

export function getRelativesByType(
  relatives: Relative[],
  type: RelationshipType
): Relative[] {
  return relatives.filter((r) => r.relationship_type === type)
}
