import { type RefObject, useEffect, useMemo } from "react"
import { Vector2 } from "three"

export type Pointer = {
    uv: Vector2
    texUv: Vector2
    repeat: Vector2
    hover: number
}

type UsePointerUvOptions = {
    enabled: boolean
    /**
     * Maps element UVs into cropped texture UVs when object-fit trims the
     * media. Defaults to identity, so `texUv` mirrors `uv`.
     */
    uvFit?: RefObject<{ x: number; y: number }>
    getRect?: (el: HTMLElement) => DOMRect
}

/**
 * Tracks the cursor over a DOM element as normalized UVs, mutated in place so
 * shader materials can read it every frame without re-rendering React.
 */
export function usePointerUv(
    el: RefObject<HTMLElement | null>,
    { enabled, uvFit, getRect }: UsePointerUvOptions,
): Pointer {
    const pointer = useMemo<Pointer>(() => {
        return {
            uv: new Vector2(0.5, 0.5),
            texUv: new Vector2(0.5, 0.5),
            repeat: new Vector2(1, 1),
            hover: 0,
        }
    }, [])

    useEffect(() => {
        if (!enabled) return
        const target = el.current
        if (!target) return

        /*
         * Pointer events still fire on the DOM element through opacity:0,
         * so the browser tells us when the cursor is over it.
         */
        const onMove = (event: PointerEvent) => {
            const rect = getRect ? getRect(target) : target.getBoundingClientRect()
            const x = (event.clientX - rect.left) / rect.width
            const y = 1 - (event.clientY - rect.top) / rect.height
            const fit = uvFit?.current ?? { x: 1, y: 1 }
            pointer.uv.set(x, y)
            pointer.texUv.set(x * fit.x + (1 - fit.x) / 2, y * fit.y + (1 - fit.y) / 2)
        }

        const onEnter = () => (pointer.hover = 1)
        const onLeave = () => (pointer.hover = 0)

        target.addEventListener("pointermove", onMove)
        target.addEventListener("pointerenter", onEnter)
        target.addEventListener("pointerleave", onLeave)

        /*
         * Hover in too fast and pointerenter fires before these listeners
         * attach, so seed hover from the live :hover state instead.
         */
        if (target.matches(":hover")) pointer.hover = 1

        return () => {
            target.removeEventListener("pointermove", onMove)
            target.removeEventListener("pointerenter", onEnter)
            target.removeEventListener("pointerleave", onLeave)
        }
    }, [enabled, el, pointer, uvFit, getRect])

    return pointer
}
