import { type ComponentRef, useCallback, useEffect, useRef } from "react"
import { useFrameLoop } from "../../hooks/use-frame-loop"

const DEFAULT_SCROLL_STATE = {
    position: 0,
    target: 0,
    momentum: 0,
    prev: 0,
    velocity: 0,
    dragMultiplier: 2.5,
}

export type InfiniteGalleryMode = "shrink" | "flip"

export type InfiniteGalleryProps<T> = {
    mode?: InfiniteGalleryMode
    data: T[]
    perView?: number
    gap?: number
    speed?: number
    inertia?: number
    className?: string
    renderItem: (item: T) => React.ReactNode
}

function lerp(start: number, end: number, factor: number) {
    return start + (end - start) * factor
}

function clamp(min: number, max: number, value: number) {
    return Math.min(max, Math.max(min, value))
}

export function InfiniteGallery<T>({
    mode = "flip",
    renderItem,
    perView = 4,
    gap = 5,
    data,
    className,
    speed = 6,
    inertia = 0.6,
}: InfiniteGalleryProps<T>) {
    const containerRef = useRef<ComponentRef<"div">>(null)
    const measureRef = useRef({ containerWidth: 0, itemWidth: 0, offsetWidth: 0 })
    const scrollRef = useRef(DEFAULT_SCROLL_STATE).current

    const calcItemsPositions = useCallback(
        (scrollOffset: number, velocity: number) => {
            const container = containerRef.current
            const { containerWidth, itemWidth, offsetWidth } = measureRef.current

            if (!container) return

            const totalWidth = data.length * itemWidth

            for (let i = 0; i < data.length; i++) {
                const containerEl = container.children[i] as HTMLElement
                if (!containerEl) return

                const totalOffset = i * itemWidth + scrollOffset

                let x = ((totalOffset % totalWidth) + totalWidth) % totalWidth

                if (x > totalWidth - itemWidth) x -= totalWidth

                const itemInView = x > -itemWidth && x < containerWidth

                if (itemInView) {
                    let transform = `translate3d(${x - i * itemWidth}px, 0, 0)`

                    if (mode === "shrink") {
                        if (x < 0) {
                            const scaleX = (x + offsetWidth) / offsetWidth
                            containerEl.style.transformOrigin = "right"
                            transform += ` scaleX(${clamp(0, 1, scaleX)})`
                        } else if (x + itemWidth > containerWidth) {
                            const scaleX = (containerWidth - x) / offsetWidth
                            containerEl.style.transformOrigin = "left"
                            transform += ` scaleX(${clamp(0, 1, scaleX)})`
                        } else {
                            containerEl.style.transformOrigin = "center"
                        }
                    }

                    if (mode === "flip") {
                        const maxDeg = 85
                        const rotate = Math.max(-maxDeg, Math.min(maxDeg, velocity * 0.02))
                        transform += ` perspective(800px) rotateY(${rotate}deg)`
                    }

                    containerEl.style.transform = transform
                    containerEl.style.visibility = "visible"
                } else {
                    containerEl.style.visibility = "hidden"
                }
            }
        },
        [data, mode],
    )

    const measure = useCallback(() => {
        const container = containerRef.current
        if (!container) return
        if (!container.children.length) return

        const firstChild = container.children[0] as HTMLElement
        const computedGap = parseFloat(getComputedStyle(container).gap) || 0

        measureRef.current = {
            containerWidth: container.getBoundingClientRect().width,
            itemWidth: firstChild.offsetWidth + computedGap,
            offsetWidth: firstChild.offsetWidth,
        }
    }, [])

    useFrameLoop((_, delta) => {
        scrollRef.target += scrollRef.momentum
        scrollRef.momentum *= inertia

        const pos = scrollRef.position
        const target = scrollRef.target

        if (Math.abs(target - pos) > 0.01 || Math.abs(scrollRef.momentum) > 0.01) {
            const factor = 1 - Math.exp(-speed * delta)
            const next = lerp(pos, target, factor)
            scrollRef.position = next

            const frameDelta = (next - scrollRef.prev) * 60
            scrollRef.prev = next

            scrollRef.velocity = lerp(scrollRef.velocity, frameDelta, 0.3)

            calcItemsPositions(next, scrollRef.velocity)
        }
    })

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resetScroll = () => {
            Object.assign(scrollRef, DEFAULT_SCROLL_STATE)
            measure()
            calcItemsPositions(0, 0)
        }

        resetScroll()

        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
            scrollRef.momentum -= event.deltaY * 0.5
        }

        const dragState = {
            startX: 0,
            isDragging: false,
            start: 0,
        }

        const onPointerDown = (event: PointerEvent) => {
            dragState.isDragging = true
            dragState.startX = event.clientX
            dragState.start = scrollRef.target
            scrollRef.momentum = 0
            container.setPointerCapture(event.pointerId)
        }

        const onPointerMove = (event: PointerEvent) => {
            if (!dragState.isDragging) return
            const delta = (event.clientX - dragState.startX) * scrollRef.dragMultiplier
            scrollRef.target = dragState.start + delta
        }

        const onPointerUp = () => {
            dragState.isDragging = false
        }

        const resizeObserver = new ResizeObserver(resetScroll)
        resizeObserver.observe(container)

        container.addEventListener("pointerdown", onPointerDown)
        container.addEventListener("pointermove", onPointerMove)
        container.addEventListener("pointerup", onPointerUp)
        container.addEventListener("wheel", onWheel, { passive: false })

        return () => {
            container.removeEventListener("pointerdown", onPointerDown)
            container.removeEventListener("pointermove", onPointerMove)
            container.removeEventListener("pointerup", onPointerUp)
            container.removeEventListener("wheel", onWheel)
            resizeObserver.disconnect()
        }
    }, [calcItemsPositions, perView, scrollRef, inertia, speed, measure])

    return (
        <div
            ref={containerRef}
            style={{ gap: `${gap}px` }}
            className={`overflow-hidden touch-pan-y user-select-none flex ${className}`}
        >
            {data.map((item, index) => {
                return (
                    <div
                        key={index}
                        className="shrink-0"
                        style={{ width: `calc(${100 / perView}%)` }}
                    >
                        {renderItem(item)}
                    </div>
                )
            })}
        </div>
    )
}
