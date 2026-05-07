"use client"

import type { MotionStyle } from "motion"
import { animate, motion, useMotionValue, useScroll, useTransform } from "motion/react"
import {
    Children,
    type ReactNode,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

export type ParallaxColumnProps = {
    children: ReactNode
    speed?: number
    autoScroll?: number
    className?: string
    containerRef?: RefObject<HTMLElement | null>
}

type Layout = {
    repetitions: number
    cycleHeight: number
    childOffsets: number[]
    offsetTop: number
    totalHeight: number
    displacement: number
}

type Measurement = {
    cycleHeight: number
    childOffsets: number[]
} | null

function measureChildren(container: HTMLElement, childCount: number): Measurement {
    if (childCount === 0) return null

    const gap = parseFloat(getComputedStyle(container).rowGap) || 0
    const childOffsets: number[] = []
    let accumulatedHeight = 0

    for (let i = 0; i < childCount; i++) {
        childOffsets.push(accumulatedHeight)
        const h = (container.children[i] as HTMLElement).offsetHeight
        accumulatedHeight += h + gap
    }

    if (accumulatedHeight <= 0) return null

    return {
        cycleHeight: accumulatedHeight,
        childOffsets,
    }
}

function renderItems(childArray: ReactNode[], layout: Layout) {
    const childCount = childArray.length
    return Array.from({ length: layout.repetitions * childCount }, (_, i) => {
        const ci = i % childCount
        const rep = Math.floor(i / childCount)
        return (
            <div
                key={i}
                className="absolute inset-x-0"
                style={{ top: rep * layout.cycleHeight + layout.childOffsets[ci] }}
                aria-hidden={i >= childCount || undefined}
            >
                {childArray[ci]}
            </div>
        )
    })
}

function renderMeasureItems(childArray: ReactNode[]) {
    return childArray.map((child, i) => (
        <div key={i} className="shrink-0">
            {child}
        </div>
    ))
}

/*
 * Simple parallax mode.
 */
function Parallax({ children, speed = 1, className }: ParallaxColumnProps) {
    const ref = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLElement | null>(null)
    const childArray = Children.toArray(children)
    const childCount = childArray.length
    const [layout, setLayout] = useState<Layout | null>(null)

    const { scrollYProgress } = useScroll({
        target: parentRef,
        offset: ["start end", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], [0, layout ? layout.displacement : 0])

    useLayoutEffect(() => {
        if (ref.current) {
            parentRef.current = ref.current.parentElement
        }
    }, [])

    useLayoutEffect(() => {
        const el = ref.current
        const parent = parentRef.current
        if (!el || !parent) return

        const calcLayout = () => {
            const measure = measureChildren(el, childCount)
            if (!measure) return

            const parentH = parent.offsetHeight
            const displacement = speed * window.innerHeight
            const needed = parentH + Math.abs(displacement)
            const repetitions = Math.ceil(needed / measure.cycleHeight) + 1
            const totalHeight = repetitions * measure.cycleHeight
            const offsetTop = -(totalHeight - parentH) / 2 - displacement / 2

            setLayout({
                offsetTop,
                totalHeight,
                displacement,
                repetitions,
                cycleHeight: measure.cycleHeight,
                childOffsets: measure.childOffsets,
            })
        }

        calcLayout()

        const observer = new ResizeObserver(calcLayout)
        observer.observe(el)
        observer.observe(parent)
        return () => observer.disconnect()
    }, [childCount, speed])

    const getLayout = (): MotionStyle => {
        if (!layout) return { visibility: "hidden" }
        return { y, top: layout.offsetTop, height: layout.totalHeight }
    }

    return (
        <motion.div
            ref={ref}
            className={`relative flex-1 flex flex-col ${className ?? ""}`}
            style={getLayout()}
        >
            {layout ? renderItems(childArray, layout) : renderMeasureItems(childArray)}
        </motion.div>
    )
}

/*
 * Auto scroll parallax mode.
 */
function AutoScrollParallax({
    children,
    speed = 1,
    autoScroll = 0,
    className,
}: ParallaxColumnProps) {
    const ref = useRef<HTMLDivElement>(null)
    const parentRef = useRef<HTMLElement | null>(null)
    const [layout, setLayout] = useState<Layout | null>(null)
    const childArray = Children.toArray(children)
    const childCount = childArray.length
    const autoY = useMotionValue(0)

    const { scrollYProgress } = useScroll({
        target: parentRef,
        offset: ["start end", "end start"],
    })

    const parallaxY = useTransform(scrollYProgress, [0, 1], [0, layout ? layout.displacement : 0])
    const y = useTransform(() => autoY.get() + parallaxY.get())

    useLayoutEffect(() => {
        if (ref.current) parentRef.current = ref.current.parentElement
    }, [])

    useLayoutEffect(() => {
        const el = ref.current
        const parent = parentRef.current
        if (!el || !parent) return

        const calcLayout = () => {
            const measure = measureChildren(el, childCount)
            if (!measure) return

            const parentH = parent.offsetHeight
            const displacement = speed * window.innerHeight
            const needed = parentH + Math.abs(displacement)
            const repetitions = Math.ceil(needed / measure.cycleHeight) + 2
            const totalHeight = repetitions * measure.cycleHeight
            const offsetTop = -(totalHeight - parentH) / 2

            setLayout({
                repetitions,
                cycleHeight: measure.cycleHeight,
                childOffsets: measure.childOffsets,
                totalHeight,
                displacement,
                offsetTop,
            })
        }

        calcLayout()

        const observer = new ResizeObserver(calcLayout)
        observer.observe(el)
        observer.observe(parent)
        return () => observer.disconnect()
    }, [childCount, speed])

    useEffect(() => {
        if (!layout || !autoScroll) return

        autoY.jump(0)

        const controls = animate(autoY, (autoScroll > 0 ? -1 : 1) * layout.cycleHeight, {
            duration: layout.cycleHeight / (Math.abs(autoScroll) * 50),
            repeat: Infinity,
            ease: "linear",
        })

        return () => controls.stop()
    }, [layout, autoScroll, autoY])

    const getLayout = (): MotionStyle => {
        if (!layout) return { visibility: "hidden" }
        return { y, top: layout.offsetTop, height: layout.totalHeight }
    }

    return (
        <motion.div
            ref={ref}
            className={`relative flex-1 flex flex-col ${className ?? ""}`}
            style={getLayout()}
        >
            {layout ? renderItems(childArray, layout) : renderMeasureItems(childArray)}
        </motion.div>
    )
}

export function InfiniteParallax({
    children,
    speed = 1,
    autoScroll = -0.2,
    className,
}: ParallaxColumnProps) {
    if (autoScroll) {
        return (
            <AutoScrollParallax speed={speed} autoScroll={autoScroll} className={className}>
                {children}
            </AutoScrollParallax>
        )
    }
    return (
        <Parallax speed={speed} className={className}>
            {children}
        </Parallax>
    )
}
