"use client"

import { animate, type MotionValue, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect } from "react"
import DashedBorder from "@/components/ui/DashedBorder"
import { expoInOut } from "@/lib/easing"

const MAX_Y = 80 as const

function getNextTarget(current: number, minDistance = 10) {
    let target: number
    do {
        target = Math.round(Math.random() * MAX_Y)
    } while (Math.abs(target - current) < minDistance)
    return target
}

function Cell({ progress }: { progress: MotionValue<number> }) {
    const top = useTransform(progress, (v) => `${v}%`)
    const percent = useTransform(() => `${100 - Math.round(progress.get())}%`)

    useEffect(() => {
        let controls: ReturnType<typeof animate>

        function next() {
            const target = getNextTarget(progress.get())
            controls = animate(progress, target, {
                duration: 1.2,
                delay: 1,
                ease: expoInOut,
                onComplete: next,
            })
        }

        next()
        return () => controls?.stop()
    }, [progress])

    return (
        <motion.div className="rounded-lg h-full w-full relative bg-mat-5 overflow-hidden">
            <motion.div
                className="w-full absolute left-0 h-full flex justify-center bg-mat-4"
                style={{ top }}
            >
                <motion.div className="absolute h-5 w-8 rounded-lg border border-mat-1/20 flex items-center justify-center font-mono text-xs bg-background z-1 top-2">
                    <motion.span className="text-mat-1/80">{percent}</motion.span>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

export default function LandingLoopPerf() {
    const tube1 = useMotionValue(0)
    const tube2 = useMotionValue(0)
    const tube3 = useMotionValue(0)

    const avgTop = useTransform(() => `${(tube1.get() + tube2.get() + tube3.get()) / 3}%`)

    return (
        <div
            role="presentation"
            aria-label="Performance"
            className="relative flex gap-3 h-full rounded-md"
        >
            <motion.div className="absolute z-2 left-0 w-full" style={{ top: avgTop }}>
                <DashedBorder direction="horizontal" className="text-highlight/80 w-full" />
            </motion.div>

            {[tube1, tube2, tube3].map((progress, index) => (
                <Cell key={index} progress={progress} />
            ))}
        </div>
    )
}
