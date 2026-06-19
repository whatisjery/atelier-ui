import { delay, wrap } from "motion"
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
} from "motion/react"
import { Children, isValidElement, type ReactNode, useEffect, useRef, useState } from "react"

type TrailItem = {
    id: number
    x: number
    y: number
    driftX: number
    driftY: number
    rotate: number
    node: ReactNode
}

export type ImageTrailProps = {
    children: ReactNode
    removeDelay?: number
    driftAmount?: number
    spawnDistance?: number
}

export function ImageTrail({
    children,
    removeDelay = 1.0,
    driftAmount = 36,
    spawnDistance = 76,
}: ImageTrailProps) {
    const childrenArray = Children.toArray(children).filter(isValidElement)
    const [items, setItems] = useState<TrailItem[]>([])
    const sum = useRef(0)
    const itemIndex = useRef(0)
    const idCounter = useRef(0)
    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)

    const distanceInPixels = useTransform(() => {
        const mouseX = pointerX.get()
        const mouseY = pointerY.get()
        const dx = mouseX - (pointerX.getPrevious() ?? mouseX)
        const dy = mouseY - (pointerY.getPrevious() ?? mouseY)

        return Math.sqrt(dx * dx + dy * dy)
    })

    useMotionValueEvent(distanceInPixels, "change", (latest) => {
        sum.current += latest
        if (sum.current >= spawnDistance) {
            const mouseX = pointerX.get()
            const mouseY = pointerY.get()

            const prevMouseX = pointerX.getPrevious() ?? mouseX
            const prevMouseY = pointerY.getPrevious() ?? mouseY

            const dx = mouseX - prevMouseX
            const dy = mouseY - prevMouseY

            const dist = Math.sqrt(dx * dx + dy * dy)

            const nx = dx / dist
            const ny = dy / dist
            const angle = Math.atan2(ny, nx) * (180 / Math.PI)
            const item: TrailItem = {
                id: idCounter.current++,
                x: mouseX,
                y: mouseY,
                driftX: nx * driftAmount + (Math.random() - 0.5) * driftAmount * 0.5,
                driftY: ny * driftAmount + (Math.random() - 0.5) * driftAmount * 0.5,
                rotate: angle * 0.15,
                node: childrenArray[itemIndex.current],
            }

            setItems((prev) => [...prev, item])

            itemIndex.current = wrap(0, childrenArray.length, itemIndex.current + 1)

            delay(() => {
                setItems((prev) => prev.filter((i) => i.id !== item.id))
            }, removeDelay)

            sum.current = 0
        }
    })

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            pointerX.set(event.clientX)
            pointerY.set(event.clientY)
        }

        window.addEventListener("pointermove", handlePointerMove)
        return () => window.removeEventListener("pointermove", handlePointerMove)
    }, [pointerX, pointerY])

    return (
        <AnimatePresence>
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    className="pointer-events-none"
                    style={{
                        position: "fixed",
                        left: item.x,
                        top: item.y,
                        translate: "-50% -50%",
                    }}
                    initial={{ scale: 0, x: 0, y: 0, rotate: item.rotate }}
                    animate={{
                        scale: 1,
                        x: item.driftX,
                        y: item.driftY,
                        rotate: item.rotate,
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                        scale: { type: "spring", stiffness: 260, damping: 20, mass: 1 },
                        x: { type: "spring", stiffness: 60, damping: 18, mass: 0.8 },
                        y: { type: "spring", stiffness: 60, damping: 18, mass: 0.8 },
                        rotate: { type: "spring", stiffness: 60, damping: 18, mass: 0.8 },
                    }}
                >
                    {item.node}
                </motion.div>
            ))}
        </AnimatePresence>
    )
}
