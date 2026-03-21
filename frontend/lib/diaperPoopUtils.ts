/**
 * うんち詳細フィールド（色・状態・量）の解決ユーティリティ
 * 「その他」が選択された場合はカスタム入力値を返す
 */
export function resolvePoopField(value: string | undefined, customValue: string | undefined): string | null {
    if (!value) return null
    if (value === "その他") return customValue?.trim() || null
    return value
}
