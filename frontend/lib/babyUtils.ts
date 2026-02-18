/**
 * 赤ちゃんの出生前/出生後に関するユーティリティ関数
 */

/** 赤ちゃんが出生済みかどうかを判定する */
export function isBorn(birthday?: string | null): boolean {
    return !!birthday;
}

/** 予定日までの残り日数を計算する（正: 予定日前、負: 予定日超過） */
export function calcDaysUntilDue(dueDate?: string | null): number | null {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    // 日付部分のみで比較（時間は無視）
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = dueDay.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** 出生前の表示ラベルを生成する */
export function getPrenatalLabel(dueDate?: string | null): string {
    const days = calcDaysUntilDue(dueDate);
    if (days === null) return "出産前";
    if (days > 0) return `出産予定日まであと ${days} 日`;
    if (days === 0) return "出産予定日です！";
    return `予定日を ${Math.abs(days)} 日過ぎています`;
}
