const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + "/api"

export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const detail = (body as { detail?: string }).detail ?? ""
        throw new Error(`写真のアップロードに失敗しました${detail ? ": " + detail : ""}`)
    }

    const { public_url } = await res.json()
    return public_url
}
