const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "") + "/api"

interface PresignedUrlResponse {
    upload_url: string
    public_url: string
    filename: string
}

export async function uploadImage(file: File): Promise<string> {
    // 1. 署名付きURL を取得
    const presignedRes = await fetch(`${API_BASE}/upload/presigned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            filename: file.name,
            content_type: file.type,
        }),
    })
    if (!presignedRes.ok) {
        const body = await presignedRes.json().catch(() => ({}))
        const detail = (body as { detail?: string }).detail ?? ""
        throw new Error(`アップロードの準備に失敗しました (${presignedRes.status}${detail ? ": " + detail : ""})`)
    }
    const { upload_url, public_url }: PresignedUrlResponse = await presignedRes.json()

    // 2. R2 へ直接 PUT
    const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    })
    if (!putRes.ok) {
        throw new Error("写真のアップロードに失敗しました。再度お試しください")
    }

    return public_url
}
