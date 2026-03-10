/**
 * 実績解除イベントのグローバルイベントエミッター。
 * useBaseRecord から発火し、AchievementUnlockPopup が受信する。
 */
export interface UnlockedAchievementInfo {
    achievement_id: string
    name: string
    icon: string
    category: string
    rarity: string
    description: string
}

type Listener = (achievements: UnlockedAchievementInfo[]) => void

const listeners: Set<Listener> = new Set()

export const achievementEvents = {
    emit(achievements: UnlockedAchievementInfo[]): void {
        listeners.forEach((l) => l(achievements))
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener)
        return () => listeners.delete(listener)
    },
}
