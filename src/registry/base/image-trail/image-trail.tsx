import { delay, wrap } from "motion"
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useTransform,
} from "motion/react"
import { type RefObject, useEffect, useRef, useState } from "react"

type Items<T> = {
    id: number
    x: number
    y: number
    driftX: number
    driftY: number
    rotate: number
    data: T
}

type PropsMouseTrail<T> = {
    containerRef?: RefObject<HTMLElement | null>
    data: T[]
    renderItems: (item: T) => React.ReactNode
    removeDelay?: number
    driftAmount?: number
    spawnDistance?: number
}

export function ImageTrail<T>({
    containerRef,
    data,
    renderItems,
    removeDelay = 1.2,
    driftAmount = 60,
    spawnDistance = 120,
}: PropsMouseTrail<T>) {
    const [items, setItems] = useState<Items<T>[]>([])
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
            const item = {
                id: idCounter.current++,
                x: mouseX,
                y: mouseY,
                driftX: nx * driftAmount + (Math.random() - 0.5) * driftAmount * 0.5,
                driftY: ny * driftAmount + (Math.random() - 0.5) * driftAmount * 0.5,
                rotate: angle * 0.15,
                data: data[itemIndex.current],
            }

            setItems((prev) => [...prev, item])

            itemIndex.current = wrap(0, data.length, itemIndex.current + 1)

            delay(() => {
                setItems((prev) => prev.filter((i) => i.id !== item.id))
            }, removeDelay)

            sum.current = 0
        }
    })

    useEffect(() => {
        const container = containerRef?.current

        const handlePointerMove = (event: Event) => {
            const e = event as PointerEvent
            if (container) {
                const rect = container.getBoundingClientRect()
                pointerX.set(e.clientX - rect.left)
                pointerY.set(e.clientY - rect.top)
            } else {
                pointerX.set(e.clientX)
                pointerY.set(e.clientY)
            }
        }
        const target = container ?? window
        target.addEventListener("pointermove", handlePointerMove)
        return () => target.removeEventListener("pointermove", handlePointerMove)
    }, [containerRef, pointerX, pointerY])

    return (
        <AnimatePresence>
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    className="pointer-events-none"
                    style={{
                        position: containerRef ? "absolute" : "fixed",
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
                    {renderItems(item.data)}
                </motion.div>
            ))}
        </AnimatePresence>
    )
}
