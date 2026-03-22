"use client"

import { useEffect, useRef, useCallback } from "react"
import { BabyRecord } from "@/types/record"

// Matter.js は dynamic import のみで使う（SSR 回避）
import type { Engine, Runner, Body } from "matter-js"

export const JAR_WIDTH = 220
export const JAR_HEIGHT = 320
// 瓶の内側の幅・壁の厚さ
const WALL_THICK = 20
const JAR_INNER_W = JAR_WIDTH - WALL_THICK * 2
// 瓶口（上部の開口部）から少し内側を落下開始点に使う
export const DROP_X_CENTER = JAR_WIDTH / 2
export const DROP_Y_START = 10

// 正六角形の外接円半径
const HEX_RADIUS = 18

type BodyMap = Map<number, Body> // record.id → Body

export interface JarCanvasHandle {
    addRecord: (record: BabyRecord) => void
    clearAll: () => void
    getBodyPositions: () => Map<number, { x: number; y: number; angle: number }>
}

interface Props {
    records: BabyRecord[]
    onReady?: (handle: JarCanvasHandle) => void
}

function hexVertices(R: number) {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        return { x: R * Math.cos(angle), y: R * Math.sin(angle) }
    })
}

export function JarCanvas({ records, onReady }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<Engine | null>(null)
    const runnerRef = useRef<Runner | null>(null)
    const bodyMapRef = useRef<BodyMap>(new Map())
    const handleRef = useRef<JarCanvasHandle | null>(null)
    const rafRef = useRef<number>(0)
    const prevRecordIdsRef = useRef<Set<number>>(new Set())

    const getBodyPositions = useCallback((): Map<number, { x: number; y: number; angle: number }> => {
        const result = new Map<number, { x: number; y: number; angle: number }>()
        bodyMapRef.current.forEach((body, id) => {
            result.set(id, { x: body.position.x, y: body.position.y, angle: body.angle })
        })
        return result
    }, [])

    // Matter.js の初期化（クライアントサイドのみ）
    useEffect(() => {
        let destroyed = false

        async function init() {
            const Matter = await import("matter-js")
            const decomp = await import("poly-decomp")
            // poly-decomp を Matter.js に登録
            Matter.Common.setDecomp(decomp.default ?? decomp)

            if (destroyed || !canvasRef.current) return

            const engine = Matter.Engine.create({ gravity: { y: 1.2 } })
            const runner = Matter.Runner.create()
            engineRef.current = engine
            runnerRef.current = runner

            // 瓶の壁（静的ボディ）
            const wallOpts = { isStatic: true, friction: 0.5, restitution: 0.05 }
            const leftWall = Matter.Bodies.rectangle(
                WALL_THICK / 2, JAR_HEIGHT / 2, WALL_THICK, JAR_HEIGHT, wallOpts
            )
            const rightWall = Matter.Bodies.rectangle(
                JAR_WIDTH - WALL_THICK / 2, JAR_HEIGHT / 2, WALL_THICK, JAR_HEIGHT, wallOpts
            )
            const floor = Matter.Bodies.rectangle(
                JAR_WIDTH / 2, JAR_HEIGHT - WALL_THICK / 2, JAR_WIDTH, WALL_THICK, wallOpts
            )
            Matter.World.add(engine.world, [leftWall, rightWall, floor])

            Matter.Runner.run(runner, engine)

            const handle: JarCanvasHandle = {
                addRecord: (record: BabyRecord) => {
                    if (bodyMapRef.current.has(record.id)) return
                    // 瓶口の中央付近からランダムなX位置で落下
                    const x = WALL_THICK + HEX_RADIUS + Math.random() * (JAR_INNER_W - HEX_RADIUS * 2)
                    const verts: Matter.Vector[] = hexVertices(HEX_RADIUS)
                    // fromVertices は Vector[][] を受け取る（複数の凸ポリゴン配列）
                    const body = Matter.Bodies.fromVertices(x, DROP_Y_START, [verts], {
                        restitution: 0.12,
                        friction: 0.6,
                        density: 0.004,
                        frictionAir: 0.01,
                        label: String(record.id),
                    }, true)
                    // fromVertices は重心を原点として生成するためオフセット調整
                    Matter.Body.setPosition(body, { x, y: DROP_Y_START })
                    Matter.World.add(engine.world, body)
                    bodyMapRef.current.set(record.id, body)
                },
                clearAll: () => {
                    bodyMapRef.current.forEach(body => {
                        Matter.World.remove(engine.world, body)
                    })
                    bodyMapRef.current.clear()
                },
                getBodyPositions,
            }
            handleRef.current = handle
            onReady?.(handle)

            // Canvas への手動描画ループ
            const ctx = canvasRef.current?.getContext("2d")

            function drawLoop() {
                if (destroyed || !ctx || !canvasRef.current) return
                ctx.clearRect(0, 0, JAR_WIDTH, JAR_HEIGHT)
                // ボディは DOM オーバーレイ側で描画するため、Canvas は空のまま
                rafRef.current = requestAnimationFrame(drawLoop)
            }
            rafRef.current = requestAnimationFrame(drawLoop)
        }

        init()

        return () => {
            destroyed = true
            cancelAnimationFrame(rafRef.current)
            if (runnerRef.current) {
                import("matter-js").then(Matter => {
                    if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
                    if (engineRef.current) Matter.Engine.clear(engineRef.current)
                })
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // records が変わったとき、追加分のみを落下させる
    useEffect(() => {
        const handle = handleRef.current
        if (!handle) return
        const prevIds = prevRecordIdsRef.current
        const newIds = new Set(records.map(r => r.id))

        // 削除された記録
        prevIds.forEach(id => {
            if (!newIds.has(id)) {
                const body = bodyMapRef.current.get(id)
                if (body) {
                    import("matter-js").then(Matter => {
                        if (engineRef.current) Matter.World.remove(engineRef.current.world, body)
                    })
                    bodyMapRef.current.delete(id)
                }
            }
        })

        // 新規記録を時系列順に落下（古い順）
        const sorted = [...records].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        sorted.forEach((r, i) => {
            if (!prevIds.has(r.id)) {
                setTimeout(() => handle.addRecord(r), i * 80)
            }
        })

        prevRecordIdsRef.current = newIds
    }, [records])

    return (
        <canvas
            ref={canvasRef}
            width={JAR_WIDTH}
            height={JAR_HEIGHT}
            style={{ display: "block" }}
            aria-hidden
        />
    )
}
