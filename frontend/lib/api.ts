const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '') + '/api';

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

async function parseErrorBody(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return { detail: text || res.statusText };
    }
}

async function request<T>(
    url: string,
    options: RequestInit & { errorMessage?: string } = {}
): Promise<T> {
    const { errorMessage = 'API Error', ...init } = options;
    const headers = new Headers(init.headers);

    // ボディが文字列（JSONなど）で、Content-Typeが設定されていない場合、自動的にapplication/jsonを設定する
    if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // テスト環境との互換性を保つため、Headersオブジェクトをプレーンなオブジェクトに変換して渡す
    const headersObject: Record<string, string> = {};
    headers.forEach((value, key) => {
        headersObject[key] = value;
    });

    const res = await fetch(`${API_BASE}${url}`, {
        credentials: 'include',
        ...init,
        headers: headersObject,
    });

    if (!res.ok) {
        throw new ApiError(
            errorMessage,
            await parseErrorBody(res),
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
    post: async <TRes = unknown, TReq = unknown>(url: string, body: TReq, options?: { signal?: AbortSignal }): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'POST',
            body: JSON.stringify(body),
            signal: options?.signal,
        });
    },
    put: async <TRes = unknown, TReq = unknown>(url: string, body: TReq): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },
    patch: async <TRes = unknown, TReq = unknown>(url: string, body: TReq): Promise<TRes> => {
        return request<TRes>(url, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },
    delete: async <TRes = unknown>(url: string): Promise<TRes | null> => {
        return request<TRes>(url, {
            method: 'DELETE',
        });
    },
};

export const post = api.post;
export const put = api.put;
export const patch = api.patch;
export const del = api.delete;
