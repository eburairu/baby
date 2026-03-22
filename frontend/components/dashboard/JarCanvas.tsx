"use client"

import { useEffect, useRef } from "react"
import { BabyRecord } from "@/types/record"
import type { Engine, Runner, Body } from "matter-js"

export const JAR_WIDTH = 220
export const JAR_HEIGHT = 320
const WALL_THICK = 20
const JAR_INNER_W = JAR_WIDTH - WALL_THICK * 2
export const DROP_X_CENTER = JAR_WIDTH / 2
export const DROP_Y_START = 10

// Hexagon size=44 (pointy-top) の外接円半径。height/2 = 22
const HEX_RADIUS = 22

type BodyMap = Map<number, Body>

export interface JarCanvasHandle {
    addRecord: (record: BabyRecord) => void
    clearAll: () => void
    getBodyPositions: () => Map<number, { x: number; y: number; angle: number }>
}

interface Props {
    records: BabyRecord[]
    onReady?: (handle: JarCanvasHandle) => void
}

function hexVertices(R: number): { x: number; y: number }[] {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        return { x: R * Math.cos(angle), y: R * Math.sin(angle) }
    })
}

export function JarCanvas({ records, onReady }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<Engine | null>(null)
    const runnerRef = useRef<Runner | null>(null)
    const bodyMapRef = useRef<BodyMap>(new Map())
    const rafRef = useRef<number>(0)
    // 最新の records を init 完了後に参照するため ref で保持
    const recordsRef = useRef<BabyRecord[]>(records)
    const prevRecordIdsRef = useRef<Set<number>>(new Set())

    // records が変わるたびに ref を更新
    useEffect(() => {
        recordsRef.current = records
    })

    const getBodyPositions = () => {
        const result = new Map<number, { x: number; y: number; angle: number }>()
        bodyMapRef.current.forEach((body, id) => {
            result.set(id, { x: body.position.x, y: body.position.y, angle: body.angle })
        })
        return result
    }

    // Matter.js の初期化（クライアントサイドのみ）
    useEffect(() => {
        let destroyed = false

        async function init() {
            const Matter = await import("matter-js")
            const decomp = await import("poly-decomp")
            Matter.Common.setDecomp(decomp.default ?? decomp)

            if (destroyed || !canvasRef.current) return

            const engine = Matter.Engine.create({ gravity: { y: 1.2 } })
            const runner = Matter.Runner.create()
            engineRef.current = engine
            runnerRef.current = runner

            const wallOpts = { isStatic: true, friction: 0.5, restitution: 0.05 }
            Matter.World.add(engine.world, [
                Matter.Bodies.rectangle(WALL_THICK / 2, JAR_HEIGHT / 2, WALL_THICK, JAR_HEIGHT, wallOpts),
                Matter.Bodies.rectangle(JAR_WIDTH - WALL_THICK / 2, JAR_HEIGHT / 2, WALL_THICK, JAR_HEIGHT, wallOpts),
                Matter.Bodies.rectangle(JAR_WIDTH / 2, JAR_HEIGHT - WALL_THICK / 2, JAR_WIDTH, WALL_THICK, wallOpts),
            ])

            Matter.Runner.run(runner, engine)

            const addRecord = (record: BabyRecord) => {
                if (bodyMapRef.current.has(record.id)) return
                const x = WALL_THICK + HEX_RADIUS + Math.random() * (JAR_INNER_W - HEX_RADIUS * 2)
                const verts: Matter.Vector[] = hexVertices(HEX_RADIUS)
                const body = Matter.Bodies.fromVertices(x, DROP_Y_START, [verts], {
                    restitution: 0.12,
                    friction: 0.6,
                    density: 0.004,
                    frictionAir: 0.01,
                    label: String(record.id),
                }, true)
                Matter.Body.setPosition(body, { x, y: DROP_Y_START })
                Matter.World.add(engine.world, body)
                bodyMapRef.current.set(record.id, body)
            }

            const handle: JarCanvasHandle = {
                addRecord,
                clearAll: () => {
                    bodyMapRef.current.forEach(body => Matter.World.remove(engine.world, body))
                    bodyMapRef.current.clear()
                    prevRecordIdsRef.current = new Set()
                },
                getBodyPositions,
            }

            onReady?.(handle)

            // init 完了時点の records を時系列順に落下（初期表示）
            const initial = [...recordsRef.current].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
            initial.forEach((r, i) => {
                setTimeout(() => { if (!destroyed) addRecord(r) }, i * 80)
            })
            prevRecordIdsRef.current = new Set(recordsRef.current.map(r => r.id))

            // Canvas は空のままにして DOM オーバーレイ側で描画
            function drawLoop() {
                if (destroyed) return
                rafRef.current = requestAnimationFrame(drawLoop)
            }
            rafRef.current = requestAnimationFrame(drawLoop)
        }

        init()

        return () => {
            destroyed = true
            cancelAnimationFrame(rafRef.current)
            import("matter-js").then(Matter => {
                if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
                if (engineRef.current) Matter.Engine.clear(engineRef.current)
            })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // records が変わったとき差分を適用（init 完了後のみ）
    useEffect(() => {
        const engine = engineRef.current
        if (!engine) return

        const prevIds = prevRecordIdsRef.current
        const newIds = new Set(records.map(r => r.id))

        // 削除
        prevIds.forEach(id => {
            if (!newIds.has(id)) {
                const body = bodyMapRef.current.get(id)
                if (body) {
                    import("matter-js").then(Matter => Matter.World.remove(engine.world, body))
                    bodyMapRef.current.delete(id)
                }
            }
        })

        // 追加（新規のみ、時系列順に落下）
        const added = records
            .filter(r => !prevIds.has(r.id))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        added.forEach((r, i) => {
            setTimeout(() => {
                if (!engineRef.current) return
                const x = WALL_THICK + HEX_RADIUS + Math.random() * (JAR_INNER_W - HEX_RADIUS * 2)
                import("matter-js").then(Matter => {
                    const verts: Matter.Vector[] = hexVertices(HEX_RADIUS)
                    const body = Matter.Bodies.fromVertices(x, DROP_Y_START, [verts], {
                        restitution: 0.12,
                        friction: 0.6,
                        density: 0.004,
                        frictionAir: 0.01,
                        label: String(r.id),
                    }, true)
                    Matter.Body.setPosition(body, { x, y: DROP_Y_START })
                    Matter.World.add(engineRef.current!.world, body)
                    bodyMapRef.current.set(r.id, body)
                })
            }, i * 80)
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
