"use client"

import { motion } from "motion/react"
import { usePathname } from "next/navigation"
import { expoInOut } from "@/lib/easing"
import { cn } from "@/lib/utils"

type Props = React.ComponentProps<"div"> & {
    className?: string
    direction?: "horizontal" | "vertical"
}

const variants = {
    hidden: (direction: "horizontal" | "vertical") => ({
        scaleX: direction === "horizontal" ? 0 : 1,
        scaleY: direction === "vertical" ? 0 : 1,
        backgroundColor: "var(--color-mat-3)",
    }),
    visible: {
        scaleX: 1,
        scaleY: 1,
        backgroundColor: "var(--color-border)",
    },
}

export default function Border({ className, direction = "horizontal" }: Props) {
    const pathname = usePathname()
    const shouldAnimate = !pathname.includes("docs")

    return (
        <motion.div
            custom={direction}
            variants={variants}
            initial={shouldAnimate ? "hidden" : "visible"}
            animate="visible"
            transition={{
                duration: 1.8,
                delay: 0.5,
                ease: expoInOut,
            }}
            className={cn(
                "absolute z-3",
                {
                    "h-px w-screen left-1/2 -translate-x-1/2 origin-left":
                        direction === "horizontal",
                    "w-px h-full origin-top": direction === "vertical",
                },
                className,
            )}
        />
    )
}
