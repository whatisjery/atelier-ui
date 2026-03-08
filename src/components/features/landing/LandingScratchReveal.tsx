"use client"

import { useAnimationFrame, useInView } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { easeInOut } from "@/lib/easing"

const DURATION = 1000
const DISSOLVE_DURATION = 800
const LINE_WIDTH = 100
const ROWS = 5
const STEPS = 10

type Point = { x: number; y: number }

type Phase = "swipe" | "dissolve" | "done"

type ScratchRevealProps = {
    containerRef: React.RefObject<HTMLDivElement | null>
}

export function getSwipePoint(t: number, w: number, h: number): Point {
    const padX = w * 0.2
    const padY = h * 0.25
    const usableW = w - padX * 2
    const usableH = h - padY * 2

    const row = Math.min(Math.floor(t * ROWS), ROWS - 1)
    const rowT = t * ROWS - row
    const isReverse = row % 2 === 1

    const xT = isReverse ? 1 - rowT : rowT
    const x = padX + usableW * xT

    const rowCenter = padY + usableH * ((row + 0.5) / ROWS)
    const arc = -Math.sin(rowT * Math.PI) * (usableH / ROWS) * 0.25
    const y = rowCenter + arc

    const angle = -0.2
    const cx = w / 2
    const cy = h / 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return {
        x: cx + (x - cx) * cos - (y - cy) * sin,
        y: cy + (x - cx) * sin + (y - cy) * cos,
    }
}

export default function LandingScratchReveal({ containerRef }: ScratchRevealProps) {
    const inView = useInView(containerRef)
    const ctxRef = useRef<CanvasRenderingContext2D>(null)
    const elapsed = useRef(0)
    const dissolveElapsed = useRef(0)
    const [phase, setPhase] = useState<Phase>("swipe")

    // useCallback needed: Biome doesn't support React Compiler yet
    const init = useCallback((container: HTMLDivElement) => {
        const canvas = container.querySelector("canvas")
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width, height } = container.getBoundingClientRect()
        canvas.width = width
        canvas.height = height

        const style = getComputedStyle(container)
        ctx.fillStyle = style.getPropertyValue("--color-mat-4")
        ctx.fillRect(0, 0, width, height)
        ctx.globalCompositeOperation = "destination-out"
        ctx.filter = "blur(2px)"
        ctx.lineWidth = LINE_WIDTH
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        ctxRef.current = ctx
        elapsed.current = 0
        dissolveElapsed.current = 0
        setPhase("swipe")
    }, [])

    useEffect(() => {
        if (inView) {
            const container = containerRef.current
            if (container) init(container)
        }
    }, [containerRef.current, inView, init])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) =>
            init(entries[0].target as HTMLDivElement),
        )
        resizeObserver.observe(container)

        const mutationObserver = new MutationObserver(() => {
            if (container) init(container)
        })
        mutationObserver.observe(document.documentElement, {
            attributeFilter: ["class", "data-theme"],
        })

        return () => {
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
    }, [containerRef, init])

    useAnimationFrame((_, delta) => {
        if (phase === "done" || !inView) return

        const ctx = ctxRef.current
        if (!ctx) return

        const w = ctx.canvas.width
        const h = ctx.canvas.height

        if (phase === "swipe") {
            const prevT = easeInOut(Math.min(elapsed.current / DURATION, 1))
            elapsed.current = Math.min(elapsed.current + delta, DURATION)
            const currT = easeInOut(elapsed.current / DURATION)

            ctx.beginPath()
            const start = getSwipePoint(prevT, w, h)
            ctx.moveTo(start.x, start.y)

            for (let i = 1; i <= STEPS; i++) {
                const t = prevT + (currT - prevT) * (i / STEPS)
                const pt = getSwipePoint(t, w, h)
                ctx.lineTo(pt.x, pt.y)
            }

            ctx.stroke()

            if (elapsed.current >= DURATION) {
                dissolveElapsed.current = 0
                setPhase("dissolve")
            }
        } else if (phase === "dissolve") {
            dissolveElapsed.current += delta
            const t = Math.min(dissolveElapsed.current / DISSOLVE_DURATION, 1)
            const ease = easeInOut(t)
            const maxDim = Math.max(w, h)

            ctx.lineWidth = LINE_WIDTH + ease * maxDim

            ctx.beginPath()
            const start = getSwipePoint(0, w, h)
            ctx.moveTo(start.x, start.y)

            for (let i = 1; i <= ROWS * STEPS; i++) {
                const pt = getSwipePoint(i / (ROWS * STEPS), w, h)
                ctx.lineTo(pt.x, pt.y)
            }

            ctx.stroke()

            if (t >= 1) setPhase("done")
        }
    })

    return (
        <canvas
            className={`absolute pointer-events-none inset-0 z-2 opacity-[0.7] ${
                phase === "done" ? "hidden" : ""
            }`}
        />
    )
}
