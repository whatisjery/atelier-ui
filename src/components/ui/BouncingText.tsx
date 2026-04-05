import { motion } from "motion/react"
import { type ComponentProps, type ComponentRef, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
    children: React.ReactNode
    maxWidth?: number | string
    speed?: number
    pauseDelay?: number
    className?: string
} & ComponentProps<"div">

export default function BouncingText({
    children,
    maxWidth = 100,
    speed = 30,
    pauseDelay = 1,
    className,
    ...props
}: Props) {
    const containerRef = useRef<ComponentRef<"div">>(null)
    const textRef = useRef<ComponentRef<"div">>(null)
    const [overflow, setOverflow] = useState(0)

    useLayoutEffect(() => {
        if (!containerRef.current || !textRef.current) return
        const containerW = containerRef.current.offsetWidth
        const textW = textRef.current.scrollWidth
        setOverflow(Math.max(0, textW - containerW))
    }, [children])

    return (
        <div
            ref={containerRef}
            style={{ maxWidth: `${maxWidth}%` }}
            className={cn("overflow-hidden whitespace-nowrap", className)}
            {...props}
        >
            <motion.div
                ref={textRef}
                animate={overflow > 0 ? { x: [0, -overflow] } : {}}
                transition={{
                    duration: overflow / speed,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: pauseDelay,
                }}
                className="inline-block"
            >
                {children}
            </motion.div>
        </div>
    )
}
