import { useLayoutEffect, useRef, useState } from "react"

type Rect = {
    width: number
    height: number
}

const defaultRect: Rect = {
    width: 0,
    height: 0,
}

/**
 * Minimal implementation to get proper mesurement on mount.
 */
export function useRect<T extends HTMLElement = HTMLElement>() {
    const ref = useRef<T>(null)
    const [rect, setRect] = useState<Rect>(defaultRect)

    useLayoutEffect(() => {
        const refElement = ref.current
        if (!refElement) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setRect((prev) => {
                    if (prev.width === width && prev.height === height) return prev
                    return { width, height }
                })
            }
        })

        resizeObserver.observe(refElement)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return [ref, rect] as const
}
