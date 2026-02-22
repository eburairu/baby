import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { api, fetcher, isApiError, ApiError } from "@/lib/api"

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

describe("API Utilities", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("fetcher", () => {
        it("should return data on success", async () => {
            const mockData = { message: "success" }
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            })

            const result = await fetcher("/test")
            expect(result).toEqual(mockData)
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/test"), {
                credentials: "include",
                method: "GET",
                headers: {},
            })
        })

        it("should throw ApiError on failure with JSON body", async () => {
            const errorBody = { detail: "Bad Request" }
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => JSON.stringify(errorBody),
                statusText: "Bad Request",
            })

            await expect(fetcher("/test")).rejects.toThrow(ApiError)
            try {
                await fetcher("/test")
            } catch (e) {
                if (isApiError(e)) {
                    expect(e.status).toBe(400)
                    expect(e.info).toEqual(errorBody)
                }
            }
        })

        it("should throw ApiError on failure with text body", async () => {
            const errorText = "Internal Server Error"
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => errorText,
                statusText: "Internal Server Error",
            })

            try {
                await fetcher("/test")
            } catch (e) {
                if (isApiError(e)) {
                    expect(e.status).toBe(500)
                    expect(e.info).toEqual({ detail: errorText })
                }
            }
        })

        it("should throw ApiError on failure with empty body", async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => "",
                statusText: "Internal Server Error",
            })

            try {
                await fetcher("/test")
            } catch (e) {
                if (isApiError(e)) {
                    expect(e.status).toBe(500)
                    expect(e.info).toEqual({ detail: "Internal Server Error" })
                }
            }
        })
    })

    describe("api methods", () => {
        describe("post", () => {
            it("should make a POST request with correct headers and body", async () => {
                const mockResponse = { id: 1 }
                const requestBody = { name: "test" }
                fetchMock.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse,
                })

                const result = await api.post("/users", requestBody)

                expect(result).toEqual(mockResponse)
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining("/api/users"),
                    expect.objectContaining({
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                        credentials: "include",
                    })
                )
            })

            it("should handle errors", async () => {
                fetchMock.mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    text: async () => JSON.stringify({ error: "Invalid data" }),
                })

                await expect(api.post("/users", {})).rejects.toThrow(ApiError)
            })
        })

        describe("put", () => {
            it("should make a PUT request", async () => {
                const mockResponse = { id: 1, updated: true }
                const requestBody = { name: "updated" }
                fetchMock.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse,
                })

                const result = await api.put("/users/1", requestBody)

                expect(result).toEqual(mockResponse)
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining("/api/users/1"),
                    expect.objectContaining({
                        method: "PUT",
                        body: JSON.stringify(requestBody),
                        headers: {
                            "content-type": "application/json",
                        },
                    })
                )
            })
        })

        describe("patch", () => {
            it("should make a PATCH request", async () => {
                const mockResponse = { id: 1, patched: true }
                const requestBody = { name: "patched" }
                fetchMock.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockResponse,
                })

                const result = await api.patch("/users/1", requestBody)

                expect(result).toEqual(mockResponse)
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining("/api/users/1"),
                    expect.objectContaining({
                        method: "PATCH",
                        body: JSON.stringify(requestBody),
                        headers: {
                            "content-type": "application/json",
                        },
                    })
                )
            })
        })

        describe("delete", () => {
            it("should make a DELETE request", async () => {
                const mockResponse = { success: true }
                fetchMock.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                })

                const result = await api.delete("/users/1")

                expect(result).toEqual(mockResponse)
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining("/api/users/1"),
                    expect.objectContaining({
                        method: "DELETE",
                        headers: {},
                    })
                )
            })

            it("should return null on 204 No Content", async () => {
                fetchMock.mockResolvedValueOnce({
                    ok: true,
                    status: 204,
                    text: async () => "",
                })

                const result = await api.delete("/users/1")
                expect(result).toBeNull()
            })
        })
    })

    describe("isApiError", () => {
        it("should return true for ApiError instances", () => {
            const error = new ApiError("test", {}, 500)
            expect(isApiError(error)).toBe(true)
        })

        it("should return false for regular Error instances", () => {
            const error = new Error("test")
            expect(isApiError(error)).toBe(false)
        })

        it("should return false for non-error objects", () => {
            expect(isApiError({})).toBe(false)
            expect(isApiError(null)).toBe(false)
            expect(isApiError(undefined)).toBe(false)
            expect(isApiError("string")).toBe(false)
        })
    })
})
