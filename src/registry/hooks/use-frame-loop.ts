import { useEffect, useRef } from "react"

const DELTA_MAX = 0.1

type FrameLoopCallback = (time: number, delta: number) => void

export function useFrameLoop(callback: FrameLoopCallback, interval?: number) {
    const ref = useRef(callback)
    ref.current = callback

    useEffect(() => {
        let frameId = 0
        let lastTime = 0
        let lastTick = 0

        const tick = (now: number) => {
            frameId = requestAnimationFrame(tick)

            if (interval && now - lastTick < interval) return
            if (interval) lastTick = now

            const time = now * 0.001
            const delta = lastTime ? Math.min(time - lastTime, DELTA_MAX) : 0
            lastTime = time

            ref.current(time, delta)
        }

        frameId = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(frameId)
        }
    }, [interval])
}
