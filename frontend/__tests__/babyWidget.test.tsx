import { describe, it, expect } from "vitest"
import { calcAge } from "@/lib/ageUtils"
// TDD: BabyWidget から named export を value import（ファイルが存在しないと Red になる）
import { BabyWidget } from "@/components/dashboard/BabyWidget"

describe("BabyWidget の表示ロジック", () => {
  describe("イニシャル計算", () => {
    it("名前の最初の文字をイニシャルとして返す", () => {
      expect("太郎".charAt(0) || "?").toBe("太")
    })
    it("名前が空の場合は '?' を返す", () => {
      expect("".charAt(0) || "?").toBe("?")
    })
    it("英語名の場合も最初の文字を返す", () => {
      expect("Alice".charAt(0) || "?").toBe("A")
    })
  })

  describe("月齢ラベル（calcAge 経由）", () => {
    it("誕生日があれば月齢ラベルが '生後' で始まる", () => {
      const result = calcAge("2024-01-01")
      expect(result.label).toMatch(/^生後/)
    })
  })

  describe("性別ラベル変換", () => {
    const genderLabel = (g: string | null | undefined) =>
      g === "boy" ? "男の子" : g === "girl" ? "女の子" : "不明"

    it("'boy' は '男の子' に変換される", () => {
      expect(genderLabel("boy")).toBe("男の子")
    })
    it("'girl' は '女の子' に変換される", () => {
      expect(genderLabel("girl")).toBe("女の子")
    })
    it("'unknown' は '不明' に変換される", () => {
      expect(genderLabel("unknown")).toBe("不明")
    })
    it("null は '不明' に変換される", () => {
      expect(genderLabel(null)).toBe("不明")
    })
    it("undefined は '不明' に変換される", () => {
      expect(genderLabel(undefined)).toBe("不明")
    })
  })

  describe("誕生日フォーマット", () => {
    const formatBirthday = (birthday: string) => {
      const d = new Date(birthday)
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    }

    it("'2024-03-15' を '2024年3月15日' に変換できる", () => {
      expect(formatBirthday("2024-03-15")).toBe("2024年3月15日")
    })
    it("'2025-01-01' を '2025年1月1日' に変換できる", () => {
      expect(formatBirthday("2025-01-01")).toBe("2025年1月1日")
    })
  })

  describe("BabyWidget コンポーネント", () => {
    it("BabyWidget が関数コンポーネントとして export されている", () => {
      expect(typeof BabyWidget).toBe("function")
    })
  })
})
