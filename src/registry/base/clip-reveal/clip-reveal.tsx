"use client"

import { motion } from "motion/react"
import type { Easing } from "motion"
import type { ReactNode } from "react"

const DEFAULT_EASE: Easing = [0.85, 0, 0.2, 1]

export type ClipRevealProps = {
    children: ReactNode
    className?: string
    duration?: number
    ease?: Easing
    depth?: number
    top?: number
    left?: number
    bottom?: number
    right?: number
    trigger?: boolean
    onComplete?: () => void
}

export function ClipReveal({
    children,
    className,
    duration = 2,
    depth = 2,
    ease = DEFAULT_EASE,
    top = 70,
    left = 25,
    bottom = 40,
    right = 25,
    trigger = true,
    onComplete,
}: ClipRevealProps) {
    const insets = `inset(${top}% ${right}% ${bottom}% ${left}%)`

    return (
        <div className={`relative overflow-hidden ${className ?? ""}`}>
            <motion.div
                className="absolute inset-0"
                initial={{ clipPath: insets }}
                animate={{ clipPath: trigger ? "inset(0% 0% 0% 0%)" : insets }}
                transition={{ duration, ease }}
                onAnimationComplete={() => trigger && onComplete?.()}
            >
                <motion.div
                    className="w-full h-full"
                    initial={{ scale: depth }}
                    animate={{ scale: trigger ? 1 : depth }}
                    transition={{ duration, ease }}
                >
                    {children}
                </motion.div>
            </motion.div>
        </div>
    )
}
