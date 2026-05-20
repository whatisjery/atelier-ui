import { motion, useAnimationFrame, useMotionValue, useScroll, useVelocity } from "motion/react"
import { type ComponentRef, useRef } from "react"

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
    const measureRef = useRef<ComponentRef<"div">>(null)
    const y = useMotionValue(0)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const directionRef = useRef<1 | -1>(-1)

    useAnimationFrame((_, delta) => {
        if (!measureRef.current) return
        const height = measureRef.current.offsetHeight
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
        y.set(reversed ? -next - height : next)
    })

    return (
        <motion.div style={{ y }} className="h-full w-full">
            <div ref={measureRef}>{children}</div>
            <div aria-hidden>{children}</div>
        </motion.div>
    )
}
