const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '') + '/api';

async function parseErrorBody(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        return { detail: text || res.statusText };
    }
}

export const fetcher = async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, {
        credentials: 'include',
    });
    if (!res.ok) {
        const error: any = new Error('An error occurred while fetching the data.');
        error.info = await parseErrorBody(res);
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export const api = {
    post: async (url: string, body: any) => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) {
            const error: any = new Error('API Error');
            error.info = await parseErrorBody(res);
            error.status = res.status;
            throw error;
        }
        return res.json();
    },
    put: async (url: string, body: any) => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) {
            const error: any = new Error('API Error');
            error.info = await parseErrorBody(res);
            error.status = res.status;
            throw error;
        }
        return res.json();
    },
    patch: async (url: string, body: any) => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });
        if (!res.ok) {
            const error: any = new Error('API Error');
            error.info = await parseErrorBody(res);
            error.status = res.status;
            throw error;
        }
        return res.json();
    },
    delete: async (url: string) => {
        const res = await fetch(`${API_BASE}${url}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            const error: any = new Error('API Error');
            error.info = await parseErrorBody(res);
            error.status = res.status;
            throw error;
        }
        if (res.status === 204) return null;
        return res.json();
    },
};
