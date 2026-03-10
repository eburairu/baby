export type AchievementCategory = "count" | "funny" | "growth" | "family"
export type AchievementRarity = "common" | "rare" | "legendary"

export interface AchievementDef {
    name: string
    description: string
    icon: string
    category: AchievementCategory
    rarity: AchievementRarity
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
    // 記録回数系
    feeding_10:   { name: "はじめての10回",   description: "授乳を10回記録した",       icon: "🍼", category: "count",  rarity: "common"    },
    feeding_100:  { name: "授乳マスター",     description: "授乳を100回記録した",      icon: "🍼", category: "count",  rarity: "rare"      },
    feeding_500:  { name: "伝説の授乳師",     description: "授乳を500回記録した",      icon: "🏆", category: "count",  rarity: "legendary" },
    diaper_10:    { name: "おむつ初段",        description: "おむつ交換を10回記録した", icon: "👶", category: "count",  rarity: "common"    },
    diaper_100:   { name: "おむつ百烈拳",      description: "おむつ交換を100回記録した",icon: "💪", category: "count",  rarity: "rare"      },
    diaper_500:   { name: "おむつ無双",        description: "おむつ交換を500回記録した",icon: "🏅", category: "count",  rarity: "legendary" },
    // あるある系
    quick_redirty:   { name: "替えたそばから",    description: "おむつを替えた直後（5分以内）にまた汚れた",               icon: "😱", category: "funny",  rarity: "rare"   },
    double_diaper:   { name: "連続攻撃",          description: "24時間以内におむつ交換を15回以上記録した",                icon: "💥", category: "funny",  rarity: "rare"   },
    blowout:         { name: "まさかの大惨事",    description: "1時間以内におむつ交換を3回以上記録した",                  icon: "🚨", category: "funny",  rarity: "rare"   },
    poop_timing:     { name: "タイミングが神",    description: "授乳が終わった直後（10分以内）にうんちのおむつ交換をした", icon: "🎯", category: "funny",  rarity: "rare"   },
    midnight_feeding:{ name: "深夜の孤独",        description: "深夜0〜4時に授乳を記録した",                              icon: "🌙", category: "funny",  rarity: "common" },
    dawn_patrol:     { name: "夜明けの番人",      description: "朝4〜6時に授乳を記録した",                               icon: "🌅", category: "funny",  rarity: "common" },
    marathon_feeding:{ name: "授乳マラソン",      description: "1回の授乳が30分以上だった",                               icon: "⏱️", category: "funny",  rarity: "rare"   },
    fragmented_sleep:{ name: "細切れ人生",        description: "1日の睡眠記録が6回以上だった",                            icon: "😴", category: "funny",  rarity: "rare"   },
    long_sleep:      { name: "まとめて寝た！",    description: "連続6時間以上の睡眠を記録した",                           icon: "🎉", category: "funny",  rarity: "rare"   },
    fever_night:     { name: "心配な夜",          description: "深夜（22時〜6時）に38度以上の体温を記録した",             icon: "🌡️", category: "funny",  rarity: "rare"   },
    // 成長系
    weight_double:   { name: "2倍の重さ",         description: "体重が最初の記録の2倍に達した",      icon: "⚖️",  category: "growth", rarity: "rare"      },
    weight_5kg:      { name: "5kgの壁",            description: "体重5kgを達成した",                  icon: "🎈",  category: "growth", rarity: "common"    },
    weight_10kg:     { name: "10kgへの道",         description: "体重10kgを達成した",                 icon: "🏋️", category: "growth", rarity: "rare"      },
    first_milestone: { name: "初めての記念日",     description: "最初のマイルストーンを記録した",     icon: "⭐",  category: "growth", rarity: "common"    },
    one_month:       { name: "1ヶ月おめでとう",   description: "生後1ヶ月を迎えた",                  icon: "🎊",  category: "growth", rarity: "common"    },
    three_months:    { name: "3ヶ月おめでとう",   description: "生後3ヶ月を迎えた",                  icon: "🎊",  category: "growth", rarity: "common"    },
    half_year:       { name: "半年おめでとう",     description: "生後6ヶ月を迎えた",                  icon: "🎉",  category: "growth", rarity: "rare"      },
    first_birthday:  { name: "1歳おめでとう！",   description: "生後1年を迎えた",                    icon: "🎂",  category: "growth", rarity: "legendary" },
    // 家族参加系
    partner_records: { name: "ふたりで育てる",    description: "2人以上のメンバーが記録を残した",     icon: "👨‍👩‍👧",  category: "family", rarity: "common"    },
    family_records:  { name: "みんなで育てる",    description: "3人以上のメンバーが記録を残した",     icon: "👨‍👩‍👧‍👦", category: "family", rarity: "rare"      },
    days_100:        { name: "100日記録",          description: "100日間、誰かが記録を残し続けた",    icon: "📅",  category: "family", rarity: "legendary" },
}

export const RARITY_LABEL: Record<AchievementRarity, string> = {
    common: "コモン",
    rare: "レア",
    legendary: "レジェンダリー",
}

export const RARITY_COLOR: Record<AchievementRarity, string> = {
    common: "text-gray-500 dark:text-zinc-400",
    rare: "text-indigo-500 dark:text-indigo-400",
    legendary: "text-amber-500 dark:text-amber-400",
}

export const CATEGORY_LABEL: Record<AchievementCategory, string> = {
    count: "記録回数",
    funny: "あるある",
    growth: "成長",
    family: "家族",
}
