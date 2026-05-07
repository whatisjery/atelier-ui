import { wrap } from "motion"
import {
    type MotionValue,
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
} from "motion/react"

import {
    Children,
    isValidElement,
    type ReactElement,
    type ReactNode,
    useEffect,
    useRef,
} from "react"

function lerp(current: number, target: number, factor: number) {
    return current + (target - current) * factor
}

export type InfiniteZoomProps = {
    children: ReactNode
    zoomAmount?: number
    lerpValue?: number
    className?: string
    backgroundSpeed?: number
}

type ItemsProps = {
    children: ReactElement
    index: number
    itemsCount: number
    zoomAmount: number
    progress: MotionValue<number>
    isClone: boolean
    deceleration: number
}

function Items({
    children,
    index,
    itemsCount,
    zoomAmount,
    progress,
    isClone,
    deceleration,
}: ItemsProps) {
    const offset = index / itemsCount
    const minScale = zoomAmount ** -(itemsCount - 1)
    const totalScale = zoomAmount ** itemsCount

    const scale = useTransform(() => {
        const position = wrap(0, 1, progress.get() + offset)
        const scaleValue = minScale * totalScale ** position

        /*
         * once the image fills reach the outer container,
         * decelerate the scaling.
         */
        const overflow = Math.max(0, scaleValue - 1)
        return scaleValue - overflow * (1 - deceleration)
    })

    const zIndex = useTransform(() => {
        const pos = wrap(0, 1, progress.get() + offset)
        return Math.floor((1 - pos) * 1000)
    })

    return (
        <motion.div
            aria-hidden={isClone || undefined}
            style={{ scale, zIndex }}
            className="absolute inset-0 flex items-center justify-center"
        >
            {children}
        </motion.div>
    )
}

export default function InfiniteZoom({
    children,
    zoomAmount = 5,
    lerpValue = 0.08,
    className,
    backgroundSpeed = 0.2,
}: InfiniteZoomProps) {
    const items = Children.toArray(children).filter(isValidElement) as ReactElement[]
    const itemsCount = items.length * 2
    const progress = useMotionValue(0)
    const smoothProgress = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useAnimationFrame(() => {
        smoothProgress.set(lerp(smoothProgress.get(), progress.get(), lerpValue))
    })

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault()
            progress.set(progress.get() + event.deltaY * 0.0001)
        }

        el.addEventListener("wheel", handleWheel, { passive: false })
        return () => el.removeEventListener("wheel", handleWheel)
    }, [progress])

    return (
        <motion.div
            ref={containerRef}
            onPan={(event, info) => {
                event.preventDefault()
                progress.set(progress.get() + info.delta.y * 0.001)
            }}
            className={`${className ?? "fixed inset-0 overflow-hidden touch-none"} `}
        >
            {Array.from({ length: itemsCount }, (_, index) => (
                <Items
                    key={index}
                    index={index}
                    itemsCount={itemsCount}
                    zoomAmount={zoomAmount}
                    progress={smoothProgress}
                    isClone={index >= items.length}
                    deceleration={backgroundSpeed}
                >
                    {items[index % items.length]}
                </Items>
            ))}
        </motion.div>
    )
}
