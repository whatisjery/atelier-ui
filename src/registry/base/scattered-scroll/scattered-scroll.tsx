import { type MotionValue, motion, useScroll, useTransform } from "motion/react"
import {
    Children,
    type ReactNode,
    type RefObject,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"

export type ScatteredScrollProps = {
    scrollTargetRef: RefObject<HTMLElement | null>
    children: ReactNode
}

// (used instead of Math.random) Avoid hydration error on next.js
function seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000
    return x - Math.floor(x)
}
const Item = ({
    children,
    progress,
    xValue,
    index,
    itemRef,
}: {
    children: ReactNode
    progress: MotionValue<number>
    xValue: number
    index: number
    itemRef?: RefObject<HTMLDivElement | null>
}) => {
    /**
     * Tweak options:
     * xPercent: horizontal offset between x and x (30 and 40 default).
     * rotation: random rotation between x and x (10 and 20 default).
     * yOffset: vertical offset in px (90 default).
     */
    const { xPercent, rotation, yOffset } = useMemo(
        () => ({
            xPercent: (seededRandom(index * 2) * 10 + 30) * (index % 2 === 0 ? 1 : -1),
            rotation: (seededRandom(index * 2 + 1) * 10 + 10) * (index % 2 === 0 ? 1 : -1),
            yOffset: (index % 2 === 0 ? 1 : -1) * 90,
        }),
        [index],
    )

    const yTranslate = useTransform(progress, [0, 0.5, 1], [yOffset, 0, -yOffset])
    const xTranslate = useTransform(progress, [0, 1], [xValue, -xValue])
    const rotate = useTransform(progress, [0, 1], [rotation, -rotation])
    const xPercentValue = useTransform(progress, [0, 1], [xPercent, -xPercent])

    const scatteredX = useTransform(
        [xTranslate, xPercentValue],
        ([px, percent]) => `calc(${px}px + ${percent}%)`,
    )

    return (
        <motion.div
            className="will-change-transform"
            ref={itemRef}
            style={{
                x: scatteredX,
                rotate: rotate,
                y: yTranslate,
            }}
        >
            {children}
        </motion.div>
    )
}

export default function ScatteredScroll({ children, scrollTargetRef }: ScatteredScrollProps) {
    const childrenArray = Children.toArray(children)
    const firstItemRef = useRef<HTMLDivElement>(null)
    const [xValue, setXValue] = useState(0)

    useLayoutEffect(() => {
        if (typeof window === "undefined") return

        const update = () => {
            const containerWidth = window.innerWidth * 0.5
            const itemWidth = firstItemRef.current?.offsetWidth ?? 0
            setXValue(containerWidth + itemWidth * 0.5 * childrenArray.length)
        }

        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [childrenArray.length])

    const { scrollYProgress } = useScroll({
        offset: ["start start", "end end"],
        ...(scrollTargetRef ? { target: scrollTargetRef } : {}),
    })

    return (
        <>
            {childrenArray.map((child, index) => (
                <Item
                    xValue={xValue}
                    progress={scrollYProgress}
                    index={index}
                    key={index}
                    itemRef={index === 0 ? firstItemRef : undefined}
                >
                    {child}
                </Item>
            ))}
        </>
    )
}
