import { describe, it, expect } from "vitest"
import { getDisplayName, cn } from "@/lib/utils"

describe("utils", () => {
  describe("getDisplayName", () => {
    it("should return trimmed display_name when it exists", () => {
      const user = { username: "johndoe", display_name: " John Doe " }
      expect(getDisplayName(user)).toBe("John Doe")
    })

    it("should return username when display_name is null", () => {
      const user = { username: "johndoe", display_name: null }
      expect(getDisplayName(user)).toBe("johndoe")
    })

    it("should return username when display_name is undefined", () => {
      const user = { username: "johndoe" }
      expect(getDisplayName(user)).toBe("johndoe")
    })

    it("should return username when display_name is an empty string", () => {
      const user = { username: "johndoe", display_name: "" }
      expect(getDisplayName(user)).toBe("johndoe")
    })

    it("should return username when display_name is only whitespace", () => {
      const user = { username: "johndoe", display_name: "   " }
      expect(getDisplayName(user)).toBe("johndoe")
    })
  })

  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar")
    })

    it("should handle conditional classes", () => {
      expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar")
    })

    it("should resolve tailwind class conflicts", () => {
      expect(cn("px-2 py-2", "p-4")).toBe("p-4")
    })

    it("should handle undefined and null", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
    })
  })
})
