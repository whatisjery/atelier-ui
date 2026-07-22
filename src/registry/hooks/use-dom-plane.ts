import { useFrame, useThree } from "@react-three/fiber"
import { type RefObject, useCallback, useRef } from "react"
import type { Mesh } from "three"

type UseDomPlaneOptions = {
    /**
     * Re-measures the DOM rect every frame so the plane follows animated
     * parents (motion, parallax). Costs one layout read per frame.
     */
    autoReflow: boolean
    fitScale?: RefObject<{ x: number; y: number }>
    getRect?: (el: HTMLElement) => DOMRect
}

/**
 * Positions and scales a mesh to cover a DOM element on the shared canvas.
 * Scroll is applied every frame. Layout changes are not observed here: the
 * caller calls `measureBounds` when the element resizes or repaints.
 */
export function useDomPlane(
    el: RefObject<HTMLElement | null>,
    mesh: RefObject<Mesh | null>,
    { autoReflow, fitScale, getRect }: UseDomPlaneOptions,
) {
    const size = useThree((state) => state.size)
    const viewport = useThree((state) => state.viewport)
    const bounds = useRef({ x: 0, y: 0, width: 0, height: 0 })

    const measureBounds = useCallback(() => {
        const target = el.current
        if (!target) return null

        /*
         * Rect in document coords so viewport position later needs only
         * window.scrollX/Y, instead of re-measuring bounds every render.
         */
        const rect = getRect ? getRect(target) : target.getBoundingClientRect()
        bounds.current.x = rect.left + window.scrollX
        bounds.current.y = rect.top + window.scrollY
        bounds.current.width = rect.width
        bounds.current.height = rect.height
        return rect
    }, [el, getRect])

    useFrame(() => {
        const m = mesh.current
        if (!m) return
        const pxToWorld = viewport.height / size.height
        const fit = fitScale?.current ?? { x: 1, y: 1 }

        const transitioning = document.documentElement.hasAttribute("data-atelier-transitioning")

        if ((autoReflow || transitioning) && el.current) {
            const rect = getRect ? getRect(el.current) : el.current.getBoundingClientRect()
            m.position.x = (rect.left + rect.width / 2 - size.width / 2) * pxToWorld
            m.position.y = -(rect.top + rect.height / 2 - size.height / 2) * pxToWorld
            m.scale.x = rect.width * pxToWorld * fit.x
            m.scale.y = rect.height * pxToWorld * fit.y
            return
        }

        const { x, y, width, height } = bounds.current
        m.position.x = (x + width / 2 - window.scrollX - size.width / 2) * pxToWorld
        m.position.y = -(y + height / 2 - window.scrollY - size.height / 2) * pxToWorld
        m.scale.x = width * pxToWorld * fit.x
        m.scale.y = height * pxToWorld * fit.y
    })

    return measureBounds
}
