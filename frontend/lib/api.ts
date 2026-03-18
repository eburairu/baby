const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '') + '/api';
import * as Sentry from "@sentry/nextjs";

const AUTH_PAGES = ['/login', '/register'];

/** テスト可能にするためのナビゲーション抽象 */
export const _nav = {
    redirectTo: (url: string) => { window.location.href = url },
};

function handleUnauthorized(): void {
    if (typeof window === 'undefined') return;
    if (AUTH_PAGES.some(page => window.location.pathname.startsWith(page))) return;

    // 永続化ストアをクリア
    localStorage.removeItem('baby-store');
    localStorage.removeItem('offline-sync-store');

    _nav.redirectTo('/login');
}

export class ApiError extends Error {
    info: unknown;
    status: number;

    constructor(message: string, info: unknown, status: number) {
        super(message);
        this.name = 'ApiError';
        this.info = info;
        this.status = status;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function getErrorMessage(error: unknown, defaultMessage = "エラーが発生しました"): string {
    if (isApiError(error)) {
        return (error.info as { detail?: string })?.detail || defaultMessage;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
}

async function parseErrorBody(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return { detail: text || res.statusText };
    }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
    errorMessage?: string;
}

async function request<T>(
    url: string,
    options: RequestInit & { errorMessage?: string } = {}
): Promise<T> {
    const { errorMessage = 'API Error', ...init } = options;

    // ヘッダーの正規化とデフォルト設定
    const headers = new Headers(init.headers);

    // ボディが文字列（JSONなど）で、Content-Typeが設定されていない場合、自動的にapplication/jsonを設定する
    if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // テスト環境との互換性を保つため、Headersオブジェクトをプレーンなオブジェクトに変換して渡す
    const headersRecord: Record<string, string> = {};
    headers.forEach((value, key) => {
        headersRecord[key] = value;
    });

    const res = await fetch(`${API_BASE}${url}`, {
        credentials: 'include',
        ...init,
        headers: headersRecord,
    });

    if (!res.ok) {
        const errorBody = await parseErrorBody(res);
        Sentry.logger.error("API request failed", { url, status: res.status, body: errorBody });
        if (res.status === 401) {
            handleUnauthorized();
        }
        throw new ApiError(
            errorMessage,
            errorBody,
            res.status
        );
    }

    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
}

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
    return request<T>(url, {
        method: 'GET',
        errorMessage: 'An error occurred while fetching the data.',
    });
};

export const api = {
    get: async <TRes = unknown>(url: string, options?: RequestOptions): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'GET',
            ...options,
        });
    },
    post: async <TRes = unknown, TReq = unknown>(url: string, body: TReq, options?: RequestOptions): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options,
        });
    },
    put: async <TRes = unknown, TReq = unknown>(url: string, body: TReq, options?: RequestOptions): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...options,
        });
    },
    patch: async <TRes = unknown, TReq = unknown>(url: string, body: TReq, options?: RequestOptions): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
            ...options,
        });
    },
    delete: async <TRes = unknown>(url: string, options?: RequestOptions): Promise<TRes | null> => {
        return request<TRes>(url, {
            method: 'DELETE',
            ...options,
        });
    },
};

export const post = api.post;
export const put = api.put;
export const patch = api.patch;
export const del = api.delete;
