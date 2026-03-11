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
    // 記録回数系（追加）
    diaper_1000:     { name: "おむつの神様",       description: "おむつ交換を1000回記録した",          icon: "👼",  category: "count",  rarity: "legendary" },
    feeding_1000:    { name: "授乳の神様",         description: "授乳を1000回記録した",                icon: "✨",  category: "count",  rarity: "legendary" },
    sleep_10:        { name: "ねんね初段",         description: "睡眠記録を10回した",                  icon: "😴",  category: "count",  rarity: "common"    },
    sleep_100:       { name: "ねんねマスター",     description: "睡眠記録を100回した",                 icon: "🌙",  category: "count",  rarity: "rare"      },
    temp_10:         { name: "検温マスター",       description: "体温記録を10回した",                  icon: "🌡️", category: "count",  rarity: "common"    },
    // あるある系（追加）
    midnight_diaper:    { name: "真夜中のおむつ戦士",   description: "深夜0〜4時におむつ交換を記録した",                    icon: "🌙",  category: "funny",  rarity: "common"    },
    clean_swap:         { name: "空振り交換",           description: "汚れていないのにおむつ交換した（CLEANタイプ）",        icon: "🤔",  category: "funny",  rarity: "rare"      },
    blowout_pro:        { name: "メガ大惨事",           description: "1時間以内におむつ交換を5回以上記録した",              icon: "💣",  category: "funny",  rarity: "legendary" },
    super_marathon:     { name: "授乳ウルトラマラソン", description: "1回の授乳が60分以上だった",                           icon: "🏃",  category: "funny",  rarity: "rare"      },
    back_to_back:       { name: "すぐお腹ペコペコ",     description: "前回授乳終了から1時間以内に次の授乳を開始した",       icon: "🍼",  category: "funny",  rarity: "common"    },
    golden_sleep:       { name: "伝説の爆睡",           description: "連続8時間以上の睡眠を記録した",                       icon: "💤",  category: "funny",  rarity: "legendary" },
    power_nap:          { name: "これは睡眠？",         description: "30分未満の睡眠を記録した",                            icon: "⚡",  category: "funny",  rarity: "common"    },
    extreme_fragmented: { name: "超細切れ睡眠",         description: "1日に睡眠記録が10回以上だった",                       icon: "🔪",  category: "funny",  rarity: "legendary" },
    perfect_temp:       { name: "完璧体温",             description: "36.5度ちょうど（±0.05度以内）を記録した",             icon: "🎯",  category: "funny",  rarity: "rare"      },
    high_fever:         { name: "39度の強敵",           description: "39度以上の発熱を記録した",                            icon: "🔥",  category: "funny",  rarity: "rare"      },
    christmas_record:   { name: "サンタも育児中",       description: "12月25日に記録した",                                  icon: "🎄",  category: "funny",  rarity: "rare"      },
    new_year_record:    { name: "正月も育児",           description: "1月1日に記録した",                                    icon: "🎍",  category: "funny",  rarity: "rare"      },
    triple_record:      { name: "フルコース育児",       description: "1時間以内に授乳・おむつ・睡眠を全て記録した",         icon: "🍽️", category: "funny",  rarity: "rare"      },
    // 成長系（追加）
    weight_7kg:      { name: "ずっしりズシン",     description: "体重7kgを達成した",                  icon: "⚖️",  category: "growth", rarity: "common"    },
    weight_15kg:     { name: "重量級チャンピオン", description: "体重15kgを達成した",                 icon: "🏋️", category: "growth", rarity: "legendary" },
    height_60cm:     { name: "60センチ突破",       description: "身長60cmを達成した",                 icon: "📏",  category: "growth", rarity: "common"    },
    height_80cm:     { name: "80センチ大台",       description: "身長80cmを達成した",                 icon: "📐",  category: "growth", rarity: "rare"      },
    second_birthday: { name: "2歳おめでとう！",   description: "生後730日を迎えた",                  icon: "🎂",  category: "growth", rarity: "legendary" },
    // 家族系（追加）
    week_streak:     { name: "皆勤賞1週間",        description: "7日連続で誰かが記録を入力した",      icon: "📆",  category: "family", rarity: "common"    },
    month_streak:    { name: "皆勤賞1ヶ月",        description: "30日連続で誰かが記録を入力した",     icon: "🗓️", category: "family", rarity: "rare"      },
    days_200:        { name: "200日の記録",         description: "記録のある日が累計200日以上になった",icon: "📅",  category: "family", rarity: "rare"      },
    days_365:        { name: "皆勤賞1年",           description: "記録のある日が累計365日以上になった",icon: "🏆",  category: "family", rarity: "legendary" },
    midnight_hero:   { name: "深夜のふたり",        description: "深夜（0〜4時）に2人以上が別々に記録した", icon: "👥", category: "family", rarity: "rare"   },
    solo_warrior:    { name: "ワンオペの勇者",      description: "1人で24時間以内に20回以上記録した", icon: "🦸",  category: "family", rarity: "rare"      },
    all_categories:  { name: "フルレコーダー",      description: "全5種類（授乳・おむつ・睡眠・体重・体温）を記録した", icon: "📋", category: "family", rarity: "rare" },
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
