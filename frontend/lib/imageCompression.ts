import imageCompression from "browser-image-compression"
import { MAX_IMAGE_DIMENSION } from "@/constants"

const MAX_SIZE_MB = 0.8
const MAX_DIMENSION = MAX_IMAGE_DIMENSION
const MAX_UPLOAD_SIZE_MB = 5

export class ImageTooLargeError extends Error {
    constructor() {
        super(`ファイルサイズが大きすぎます（上限 ${MAX_UPLOAD_SIZE_MB}MB）`)
    }
}

export async function compressImage(file: File): Promise<File> {
    const compressed = await imageCompression(file, {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_DIMENSION,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85,
    })

    if (compressed.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        throw new ImageTooLargeError()
    }

    return compressed
}
