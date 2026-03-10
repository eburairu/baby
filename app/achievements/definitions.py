"""
実績定義。追加・削除はこのファイルのみ編集する。
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class AchievementDef:
    name: str
    description: str
    icon: str
    category: str  # "count" | "funny" | "growth" | "family"
    rarity: str    # "common" | "rare" | "legendary"


ACHIEVEMENTS: dict[str, AchievementDef] = {
    # ─── 記録回数系 ───────────────────────────────────────────────
    "feeding_10": AchievementDef(
        name="はじめての10回",
        description="授乳を10回記録した",
        icon="🍼",
        category="count",
        rarity="common",
    ),
    "feeding_100": AchievementDef(
        name="授乳マスター",
        description="授乳を100回記録した",
        icon="🍼",
        category="count",
        rarity="rare",
    ),
    "feeding_500": AchievementDef(
        name="伝説の授乳師",
        description="授乳を500回記録した",
        icon="🏆",
        category="count",
        rarity="legendary",
    ),
    "diaper_10": AchievementDef(
        name="おむつ初段",
        description="おむつ交換を10回記録した",
        icon="👶",
        category="count",
        rarity="common",
    ),
    "diaper_100": AchievementDef(
        name="おむつ百烈拳",
        description="おむつ交換を100回記録した",
        icon="💪",
        category="count",
        rarity="rare",
    ),
    "diaper_500": AchievementDef(
        name="おむつ無双",
        description="おむつ交換を500回記録した",
        icon="🏅",
        category="count",
        rarity="legendary",
    ),
    # ─── あるある系 ──────────────────────────────────────────────
    "quick_redirty": AchievementDef(
        name="替えたそばから",
        description="おむつを替えた直後（5分以内）にまた汚れた",
        icon="😱",
        category="funny",
        rarity="rare",
    ),
    "double_diaper": AchievementDef(
        name="連続攻撃",
        description="24時間以内におむつ交換を15回以上記録した",
        icon="💥",
        category="funny",
        rarity="rare",
    ),
    "blowout": AchievementDef(
        name="まさかの大惨事",
        description="1時間以内におむつ交換を3回以上記録した",
        icon="🚨",
        category="funny",
        rarity="rare",
    ),
    "poop_timing": AchievementDef(
        name="タイミングが神",
        description="授乳が終わった直後（10分以内）にうんちのおむつ交換をした",
        icon="🎯",
        category="funny",
        rarity="rare",
    ),
    "midnight_feeding": AchievementDef(
        name="深夜の孤独",
        description="深夜0〜4時に授乳を記録した",
        icon="🌙",
        category="funny",
        rarity="common",
    ),
    "dawn_patrol": AchievementDef(
        name="夜明けの番人",
        description="朝4〜6時に授乳を記録した",
        icon="🌅",
        category="funny",
        rarity="common",
    ),
    "marathon_feeding": AchievementDef(
        name="授乳マラソン",
        description="1回の授乳が30分以上だった",
        icon="⏱️",
        category="funny",
        rarity="rare",
    ),
    "fragmented_sleep": AchievementDef(
        name="細切れ人生",
        description="1日の睡眠記録が6回以上だった",
        icon="😴",
        category="funny",
        rarity="rare",
    ),
    "long_sleep": AchievementDef(
        name="まとめて寝た！",
        description="連続6時間以上の睡眠を記録した",
        icon="🎉",
        category="funny",
        rarity="rare",
    ),
    "fever_night": AchievementDef(
        name="心配な夜",
        description="深夜（22時〜6時）に38度以上の体温を記録した",
        icon="🌡️",
        category="funny",
        rarity="rare",
    ),
    # ─── 成長系 ──────────────────────────────────────────────────
    "weight_double": AchievementDef(
        name="2倍の重さ",
        description="体重が最初の記録の2倍に達した",
        icon="⚖️",
        category="growth",
        rarity="rare",
    ),
    "weight_5kg": AchievementDef(
        name="5kgの壁",
        description="体重5kgを達成した",
        icon="🎈",
        category="growth",
        rarity="common",
    ),
    "weight_10kg": AchievementDef(
        name="10kgへの道",
        description="体重10kgを達成した",
        icon="🏋️",
        category="growth",
        rarity="rare",
    ),
    "first_milestone": AchievementDef(
        name="初めての記念日",
        description="最初のマイルストーンを記録した",
        icon="⭐",
        category="growth",
        rarity="common",
    ),
    "one_month": AchievementDef(
        name="1ヶ月おめでとう",
        description="生後1ヶ月を迎えた",
        icon="🎊",
        category="growth",
        rarity="common",
    ),
    "three_months": AchievementDef(
        name="3ヶ月おめでとう",
        description="生後3ヶ月を迎えた",
        icon="🎊",
        category="growth",
        rarity="common",
    ),
    "half_year": AchievementDef(
        name="半年おめでとう",
        description="生後6ヶ月を迎えた",
        icon="🎉",
        category="growth",
        rarity="rare",
    ),
    "first_birthday": AchievementDef(
        name="1歳おめでとう！",
        description="生後1年を迎えた",
        icon="🎂",
        category="growth",
        rarity="legendary",
    ),
    # ─── 家族参加系 ──────────────────────────────────────────────
    "partner_records": AchievementDef(
        name="ふたりで育てる",
        description="2人以上のメンバーが記録を残した",
        icon="👨‍👩‍👧",
        category="family",
        rarity="common",
    ),
    "family_records": AchievementDef(
        name="みんなで育てる",
        description="3人以上のメンバーが記録を残した",
        icon="👨‍👩‍👧‍👦",
        category="family",
        rarity="rare",
    ),
    "days_100": AchievementDef(
        name="100日記録",
        description="100日間、誰かが記録を残し続けた",
        icon="📅",
        category="family",
        rarity="legendary",
    ),
}
