import { motion, useAnimationFrame, useMotionValue, useScroll, useVelocity } from "motion/react"
import { type ComponentRef, useEffect, useRef, useState } from "react"

export type InfiniteParallaxProps = {
    reversed?: boolean
    autoScrollSpeed?: number
    parallaxAmount?: number
    children?: React.ReactNode
}

const REVERT_THRESHOLD = 50
const PARALLAX_SCALE = 0.0001

export function InfiniteParallax({
    reversed,
    autoScrollSpeed = 0.02,
    parallaxAmount = 2,
    children,
}: InfiniteParallaxProps) {
    const offsetRef = useRef(0)
    const contentHRef = useRef(0)
    const directionRef = useRef<1 | -1>(-1)
    const containerRef = useRef<ComponentRef<"div">>(null)
    const measureRef = useRef<ComponentRef<"div">>(null)
    const [clones, setClones] = useState(1)

    const y = useMotionValue(0)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)

    useEffect(() => {
        const measure = measureRef.current
        const container = containerRef.current
        if (!measure || !container) return

        const calcClones = () => {
            const contentH = measure.getBoundingClientRect().height
            const containerH = container.getBoundingClientRect().height
            if (contentH === 0) return
            contentHRef.current = contentH
            setClones(Math.ceil(containerH / contentH))
        }

        calcClones()
        const ro = new ResizeObserver(calcClones)
        ro.observe(measure)
        ro.observe(container)

        return () => ro.disconnect()
    }, [])

    useAnimationFrame((_, delta) => {
        if (!contentHRef.current) return
        const height = contentHRef.current
        const velocity = scrollVelocity.get()

        if (Math.abs(velocity) > REVERT_THRESHOLD) {
            directionRef.current = velocity > 0 ? -1 : 1
        }

        const parallax = Math.abs(velocity) * parallaxAmount * PARALLAX_SCALE
        const step = delta * (autoScrollSpeed + parallax) * directionRef.current
        let next = offsetRef.current + step

        if (next <= -height) next = 0
        else if (next >= 0) next = -height + 1

        offsetRef.current = next
        y.set(reversed ? next : -next - height)
    })

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden">
            <motion.div style={{ y }}>
                <div ref={measureRef}>{children}</div>
                {Array.from({ length: clones }, (_, i) => (
                    <div key={i} aria-hidden>
                        {children}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
