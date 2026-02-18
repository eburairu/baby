export interface TipsItem {
  title: string;
  items: string[];
}

export interface PageTips {
  storageKey: string;
  color: "rose" | "indigo" | "amber" | "emerald" | "red" | "purple" | "slate";
  tips: TipsItem[];
}

export const feedingTips: PageTips = {
  storageKey: "tips-feeding",
  color: "rose",
  tips: [
    {
      title: "授乳間隔の目安",
      items: [
        "新生児（0〜1ヶ月）は2〜3時間ごと、1日8〜12回が目安",
        "1〜3ヶ月は2〜4時間ごとに落ち着いてきます",
        "泣く前にサインが出ることも（口をモグモグ、手を口に持っていく等）",
      ],
    },
    {
      title: "母乳授乳のコツ",
      items: [
        "片側15〜20分を目安に左右交互に授乳しましょう",
        "前回止めた方の乳房から始めると均等になります",
        "授乳後は背中をさすってゲップを促してあげましょう",
      ],
    },
  ],
};

export const sleepTips: PageTips = {
  storageKey: "tips-sleep",
  color: "indigo",
  tips: [
    {
      title: "月齢別の推奨睡眠時間",
      items: [
        "新生児〜3ヶ月: 合計14〜17時間/日（昼夜問わず細切れ）",
        "3〜6ヶ月: 合計12〜15時間/日（夜まとまって眠れるように）",
        "6〜12ヶ月: 合計12〜14時間/日",
      ],
    },
    {
      title: "安全な睡眠環境",
      items: [
        "仰向け寝を推奨（SIDS予防）",
        "柔らかすぎる布団・ぬいぐるみはそばに置かない",
        "室温の目安は20〜22℃",
      ],
    },
  ],
};

export const diaperTips: PageTips = {
  storageKey: "tips-diaper",
  color: "amber",
  tips: [
    {
      title: "1日の目安回数",
      items: [
        "新生児期: おしっこ8〜10回、うんち1〜数回が目安",
        "生後1〜2ヶ月以降: うんちの回数が減り、数日に1回も正常です",
      ],
    },
    {
      title: "うんちの色の目安",
      items: [
        "黄色・茶色: 正常",
        "緑色: 母乳過多・飲み残しによることが多く、通常問題なし",
        "白・灰色・黒色・血混じり: かかりつけ医に相談を",
      ],
    },
  ],
};

export const growthTips: PageTips = {
  storageKey: "tips-growth",
  color: "emerald",
  tips: [
    {
      title: "計測のコツ",
      items: [
        "体重は毎回同じ条件で（授乳前・服なしが理想）",
        "身長は横に寝かせ、膝をしっかり伸ばして計測",
        "頭囲は眉毛の上・後頭部の一番突き出た部分を通るように",
      ],
    },
    {
      title: "成長曲線の見方",
      items: [
        "グラフの2本の曲線は「3〜97パーセンタイル」（100人中の標準的な範囲）",
        "曲線に沿って増加していれば、線の外でも心配なし",
        "急な体重減少や2週間以上の体重停滞は医師に相談を",
      ],
    },
  ],
};

export const contractionTips: PageTips = {
  storageKey: "tips-contraction",
  color: "red",
  tips: [
    {
      title: "記録の始め方",
      items: [
        "「陣痛開始」を痛みが来たときに押す",
        "「陣痛終了」を痛みが引いたときに押す",
        "間隔と持続時間が自動で計算されます",
      ],
    },
    {
      title: "入院・連絡の目安（5-1-1ルール）",
      items: [
        "陣痛間隔5分・持続1分・1時間以上続いたら産院へ連絡",
        "経産婦は間隔10分が目安（早めに連絡を）",
        "破水・大量出血・赤ちゃんの動きが急に減ったらすぐに連絡",
      ],
    },
  ],
};

export const diaryTips: PageTips = {
  storageKey: "tips-diary",
  color: "purple",
  tips: [
    {
      title: "育児日誌について",
      items: [
        "記録した授乳・睡眠・おむつのデータからAIが日誌文を生成します",
        "生成された文章は自由に編集できます",
        "定期健診に持参すると医師との会話に役立ちます",
      ],
    },
  ],
};

export const noteTips: PageTips = {
  storageKey: "tips-note",
  color: "slate",
  tips: [
    {
      title: "メモの活用例",
      items: [
        "気になること・病院で聞きたいことのメモに",
        "赤ちゃんの体温や薬の服用記録に",
        "パートナーへの引き継ぎ連絡に",
      ],
    },
  ],
};
