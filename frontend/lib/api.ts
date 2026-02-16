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

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${url}`, {
        credentials: 'include',
    });
    if (!res.ok) {
        throw new ApiError(
            'An error occurred while fetching the data.',
            await parseErrorBody(res),
            res.status
        );
    }
    return res.json() as Promise<T>;
};

export const api = {
    post: async <TRes = unknown, TReq = unknown>(url: string, body: TReq): Promise<TRes> => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) {
            throw new ApiError('API Error', await parseErrorBody(res), res.status);
        }
        return res.json() as Promise<TRes>;
    },
    put: async <TRes = unknown, TReq = unknown>(url: string, body: TReq): Promise<TRes> => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) {
            throw new ApiError('API Error', await parseErrorBody(res), res.status);
        }
        return res.json() as Promise<TRes>;
    },
    patch: async <TRes = unknown, TReq = unknown>(url: string, body: TReq): Promise<TRes> => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) {
            throw new ApiError('API Error', await parseErrorBody(res), res.status);
        }
        return res.json() as Promise<TRes>;
    },
    delete: async <TRes = unknown>(url: string): Promise<TRes | null> => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new ApiError('API Error', await parseErrorBody(res), res.status);
        }
        if (res.status === 204) return null;
        return res.json() as Promise<TRes>;
    },
};
