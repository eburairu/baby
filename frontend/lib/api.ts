const API_BASE = 'http://localhost:8000/api';

export const fetcher = async (url: string) => {
    const res = await fetch(`${API_BASE}${url}`, {
        credentials: 'include',
    });
    if (!res.ok) {
        const error: any = new Error('An error occurred while fetching the data.');
        error.info = await res.json();
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
            error.info = await res.json();
            error.status = res.status;
            throw error;
        }
        return res.json();
    },
    // Add put, delete similarly
};
