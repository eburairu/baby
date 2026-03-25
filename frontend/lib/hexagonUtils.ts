/** 六角形（pointy-top）の頂点座標を返す */
export function hexVertices(R: number): { x: number; y: number }[] {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        return { x: R * Math.cos(angle), y: R * Math.sin(angle) }
    })
}

/** SVG polygon 用の六角形ポイント文字列を返す */
export function hexPolygonPoints(cx: number, cy: number, r: number, angle: number): string {
    return Array.from({ length: 6 }, (_, i) => {
        const a = angle + (Math.PI / 3) * i - Math.PI / 2
        return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
    }).join(" ")
}
