"use client"

import type { Easing } from "motion"
import { stagger, useAnimate } from "motion/react"
import { type ReactNode, useEffect, useRef } from "react"

const EASE: Easing = [0.85, 0, 0.2, 1]

export type SweepExitProps = {
    children?: ReactNode
    backgroundSlot: ReactNode
    duration?: number
    insetX?: number
    insetY?: number
    trigger?: boolean
    onComplete?: () => void
}

export function SweepExit({
    children,
    backgroundSlot,
    duration = 1,
    insetX = 20,
    insetY = 10,
    trigger = true,
    onComplete,
}: SweepExitProps) {
    const [scope, animate] = useAnimate()
    const configRef = useRef({ duration, onComplete })
    configRef.current = { duration, onComplete }

    useEffect(() => {
        if (!trigger) return

        let cancelled = false
        let controls: ReturnType<typeof animate> | undefined

        async function run() {
            const { duration } = configRef.current
            controls = animate([
                [
                    ".aui-clip, .aui-clip > :not(.aui-clip-bg)",
                    {
                        clipPath: [
                            "inset(0% 0% 0% 0%)",
                            `inset(${insetY}% ${insetX}% ${insetY}% ${insetX}%)`,
                        ],
                    },
                    { duration: 1.3 * duration, ease: EASE },
                ],
                [
                    ".aui-clip",
                    {
                        scale: [1, 0.9],
                    },
                    { duration: 1.3 * duration, ease: EASE, at: 0 },
                ],
                [
                    ".aui-bg-overlay",
                    {
                        scale: [2, 1],
                    },
                    { duration: 1.8 * duration, ease: EASE, at: 0 },
                ],
                [
                    ".aui-clip, .aui-clip > :not(.aui-clip-bg)",
                    { clipPath: `inset(${insetY}% ${insetX}% ${100 - insetY}% ${insetX}%)` },
                    {
                        duration: 1 * duration,
                        ease: EASE,
                        at: 1.3 * duration,
                        delay: stagger(0.05 * duration, { from: "last" }),
                    },
                ],
                [
                    ".aui-bg-overlay",
                    {
                        clipPath: `inset(0% 0% 100% 0%)`,
                    },
                    { duration: 3 * duration, ease: EASE, at: 0 },
                ],
            ])

            await controls

            if (!cancelled) {
                configRef.current.onComplete?.()
            }
        }

        run()

        return () => {
            cancelled = true
            controls?.stop()
        }
    }, [trigger, animate, insetY, insetX])

    return (
        <div ref={scope}>
            <div className="aui-bg-overlay fixed inset-0 z-50 w-screen h-screen overflow-hidden">
                {backgroundSlot}
            </div>
            <div className="aui-clip fixed inset-0 z-[60] overflow-hidden origin-center">
                <div className="aui-clip-bg absolute inset-0 -z-10">{backgroundSlot}</div>
                {children}
            </div>
        </div>
    )
}
