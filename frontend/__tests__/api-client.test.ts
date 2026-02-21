import { describe, it, expect, vi, afterEach } from "vitest"

// openapi-fetch はグローバルの fetch を使うため、モックする
const fetchMock = vi.fn()
global.fetch = fetchMock

// openapi-fetch は Node.js 環境で new URL() を使うため、
// テスト用の絶対 URL ベースが必要（ブラウザでは相対URL が動作するが Node.js では不可）
const TEST_BASE = "http://localhost"

// mock response ファクトリ（openapi-fetch は response.text() を呼ぶため必要）
function mockJsonResponse(body: unknown, status = 200) {
    const json = JSON.stringify(body)
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "Content-Type": "application/json" }),
        text: async () => json,
        json: async () => body,
        clone: function () { return this },
    }
}

describe("api-client", () => {
    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllEnvs()
        vi.resetModules()
        fetchMock.mockReset()
    })

    describe("URL 構築 — /api/api/ の二重パスにならないことの検証", () => {
        it("NEXT_PUBLIC_API_BASE_URL がオリジンのみのとき、GET /api/feedings/ が正しい URL でリクエストされる", async () => {
            // baseUrl = "http://localhost"、pathname = "/api/feedings/"
            // → 結果: "http://localhost/api/feedings/"（二重パスなし）
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
            vi.resetModules()
            const { client } = await import("@/lib/api-client")

            fetchMock.mockResolvedValueOnce(mockJsonResponse([]))

            await client.GET("/api/feedings/", {
                params: { query: { baby_id: 1 } },
            })

            expect(fetchMock).toHaveBeenCalledOnce()
            // openapi-fetch は fetch() に Request オブジェクトを渡すため .url で取得する
            const calledUrl: string = (fetchMock.mock.calls[0][0] as Request).url

            // 正しいパスでリクエストされていること
            expect(calledUrl).toBe(`${TEST_BASE}/api/feedings/?baby_id=1`)

            // /api/api/ という二重パスになっていないこと（回帰テスト）
            expect(calledUrl).not.toContain("/api/api/")
        })

        it("NEXT_PUBLIC_API_BASE_URL がオリジンのみのとき、POST /api/feedings/ が正しい URL でリクエストされる", async () => {
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
            vi.resetModules()
            const { client } = await import("@/lib/api-client")

            const responseBody = {
                id: 1,
                baby_id: 1,
                feeding_type: "BREAST",
                feeding_time: "2026-02-22T10:00:00",
                comment_count: 0,
            }
            fetchMock.mockResolvedValueOnce(mockJsonResponse(responseBody))

            await client.POST("/api/feedings/", {
                body: {
                    baby_id: 1,
                    feeding_type: "BREAST",
                    feeding_time: "2026-02-22T10:00:00",
                },
            })

            // openapi-fetch は fetch() に Request オブジェクトを渡すため .url で取得する
            const calledUrl: string = (fetchMock.mock.calls[0][0] as Request).url
            expect(calledUrl).toBe(`${TEST_BASE}/api/feedings/`)
            expect(calledUrl).not.toContain("/api/api/")
        })

        it("NEXT_PUBLIC_API_BASE_URL が本番URLのとき、正しいエンドポイントにリクエストされる", async () => {
            const prodBase = "https://example.com"
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", prodBase)
            vi.resetModules()
            const { client } = await import("@/lib/api-client")

            fetchMock.mockResolvedValueOnce(mockJsonResponse([]))

            await client.GET("/api/feedings/", {
                params: { query: { baby_id: 42 } },
            })

            // openapi-fetch は fetch() に Request オブジェクトを渡すため .url で取得する
            const calledUrl: string = (fetchMock.mock.calls[0][0] as Request).url
            expect(calledUrl).toBe(`${prodBase}/api/feedings/?baby_id=42`)
            expect(calledUrl).not.toContain("/api/api/")
        })

        it("DELETE /api/feedings/{feeding_id} がパスパラメータ付きで正しく構築される", async () => {
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
            vi.resetModules()
            const { client } = await import("@/lib/api-client")

            fetchMock.mockResolvedValueOnce(mockJsonResponse({ message: "Deleted" }))

            await client.DELETE("/api/feedings/{feeding_id}", {
                params: { path: { feeding_id: 99 } },
            })

            // openapi-fetch は fetch() に Request オブジェクトを渡すため .url で取得する
            const calledUrl: string = (fetchMock.mock.calls[0][0] as Request).url
            expect(calledUrl).toBe(`${TEST_BASE}/api/feedings/99`)
            expect(calledUrl).not.toContain("/api/api/")
        })
    })

    describe("throwOnError", () => {
        it("成功時にデータを返す", async () => {
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
            vi.resetModules()
            const { throwOnError } = await import("@/lib/api-client")

            const data = { id: 1 }
            const result = await throwOnError(Promise.resolve({ data, error: undefined }))
            expect(result).toEqual(data)
        })

        it("error が存在するときに throw する", async () => {
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
            vi.resetModules()
            const { throwOnError } = await import("@/lib/api-client")

            const error = { detail: "Unauthorized" }
            await expect(
                throwOnError(Promise.resolve({ data: undefined, error }))
            ).rejects.toEqual(error)
        })

        it("data が undefined でも error がなければ undefined を返す", async () => {
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
            vi.resetModules()
            const { throwOnError } = await import("@/lib/api-client")

            const result = await throwOnError(
                Promise.resolve({ data: undefined, error: undefined })
            )
            expect(result).toBeUndefined()
        })
    })
})
