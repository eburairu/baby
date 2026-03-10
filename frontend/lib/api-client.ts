import createClient from "openapi-fetch";
import type { paths } from "@/types/generated/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * 型安全な API クライアント
 */
export const client = createClient<paths>({
  baseUrl: API_BASE,
  credentials: "include", // 認証クッキーを送信
  bodySerializer(body) {
    return JSON.stringify(body);
  },
});

/**
 * SWR 等で使用するための、エラー時に throw する標準 fetcher
 */
export async function throwOnError<T>(promise: Promise<{ data?: T; error?: unknown }>) {
  const { data, error } = await promise;
  if (error) {
    // 必要に応じて ApiError クラス等でラップする
    throw error;
  }
  return data as T;
}
