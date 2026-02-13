/**
 * 赤ちゃんの月齢・経過時間計算ユーティリティ
 */

export function calcAge(birthday: string): { months: number; days: number; label: string } {
    const birth = new Date(birthday);
    const now = new Date();

    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    const dayOfMonth = now.getDate() - birth.getDate();

    if (dayOfMonth < 0) {
        months -= 1;
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), birth.getDate());
    if (dayOfMonth < 0) {
        // 前月の日数を使う
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        var days = prevMonth.getDate() + dayOfMonth;
    } else {
        var days = dayOfMonth;
    }

    const label = months > 0
        ? `生後 ${months}ヶ月${days > 0 ? `${days}日` : ''}`
        : `生後 ${days}日`;

    return { months, days, label };
}

export function formatElapsed(isoDateStr: string): string {
    const date = new Date(isoDateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    const diffHour = Math.floor(diffMin / 60);
    const remainMin = diffMin % 60;
    if (diffHour < 24) {
        return remainMin > 0 ? `${diffHour}時間${remainMin}分前` : `${diffHour}時間前`;
    }
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}日前`;
}

export function formatDuration(startIso: string, endIso?: string | null): string {
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}分`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export function isToday(isoDateStr: string): boolean {
    const date = new Date(isoDateStr);
    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
}
