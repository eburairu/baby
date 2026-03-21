export interface DailyTip {
    icon: string
    text: string
    /** 対象の月齢範囲（inclusive）。省略時は全月齢対象 */
    minMonths?: number
    maxMonths?: number
}

export const DAILY_TIPS: DailyTip[] = [
    // 全月齢
    { icon: "💧", text: "授乳後は縦抱きにして、背中をさすってゲップを促しましょう。" },
    { icon: "🌙", text: "赤ちゃんは仰向けで寝かせると SIDS のリスクが下がります。" },
    { icon: "🤲", text: "おむつ替えの前後は手をしっかり洗いましょう。" },
    { icon: "🌡️", text: "室温は 20〜22℃ が快適な睡眠環境の目安です。" },
    { icon: "📱", text: "記録の積み重ねが、かかりつけ医との相談をスムーズにします。" },
    { icon: "👁️", text: "目線の高さで話しかけると、赤ちゃんは表情を学びやすくなります。" },
    { icon: "🎵", text: "ゆっくりした歌声や音楽は、赤ちゃんを落ち着かせる効果があります。" },
    { icon: "🍼", text: "ミルクの温度は手首の内側に垂らして確認しましょう（人肌が目安）。" },
    // 新生児〜3ヶ月
    { icon: "⏱️", text: "新生児の授乳間隔は 2〜3 時間が目安。泣く前のサイン（口をパクパクなど）を観察してみましょう。", maxMonths: 3 },
    { icon: "🌿", text: "まだ免疫が弱い時期。面会者には手洗いをお願いしましょう。", maxMonths: 2 },
    // 3〜6ヶ月
    { icon: "🏋️", text: "うつぶせ遊び（タミータイム）は頸筋や体幹を育てます。目を離さずに短時間から始めて。", minMonths: 3, maxMonths: 6 },
    { icon: "🙂", text: "この頃から「社会的スマイル」が始まります。たくさん笑いかけてあげましょう。", minMonths: 2, maxMonths: 5 },
    // 6〜12ヶ月
    { icon: "🥄", text: "離乳食は 1 種類ずつ始めると、アレルギー反応を確認しやすくなります。", minMonths: 5, maxMonths: 12 },
    { icon: "🪑", text: "お座りが安定してきたら、床に座らせて手を使った遊びを増やしましょう。", minMonths: 6, maxMonths: 10 },
    { icon: "🚶", text: "つかまり立ちが始まったら、家具の角にカバーを付けて安全対策を。", minMonths: 8, maxMonths: 14 },
    // 1歳以降
    { icon: "📚", text: "絵本の読み聞かせは語彙力と情緒の発達に効果的です。毎日の習慣にしましょう。", minMonths: 10 },
    { icon: "🧩", text: "積み木やブロックは手先の発達と空間認識力を育てます。", minMonths: 9 },
]

/**
 * 今日の日付と赤ちゃんの月齢から「今日のヒント」を1件返す
 */
export function getTodayTip(ageMonths: number): DailyTip {
    const candidates = DAILY_TIPS.filter(tip => {
        const okMin = tip.minMonths === undefined || ageMonths >= tip.minMonths
        const okMax = tip.maxMonths === undefined || ageMonths <= tip.maxMonths
        return okMin && okMax
    })

    // 日付ベースで毎日変わるよう dayOfYear で選択
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)

    return candidates[dayOfYear % candidates.length]
}
