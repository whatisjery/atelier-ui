"use client"

import { type AnimationSequence, animate, stagger } from "motion/react"
import { useEffect } from "react"
import DashedFrame from "@/components/ui/DashedFrame"
import { expoInOut } from "@/lib/easing"
import { cn } from "@/lib/utils"

const sequence: AnimationSequence = [
    [
        ".left-block",
        {
            scale: [1, 0.98, 1],
        },
        {
            duration: 0.4,
            ease: expoInOut,
        },
    ],
    [
        ".cursor",
        {
            left: ["20%", "70%"],
        },
        {
            duration: 1,
            ease: expoInOut,
        },
    ],
    [
        [".right-block .frame"],
        {
            opacity: [0, 1],
        },
        {
            duration: 0.2,
            ease: expoInOut,
        },
    ],
    [
        ".right-block",
        {
            scale: [1, 0.98, 1],
        },
        {
            duration: 0.4,
            ease: expoInOut,
            at: "-0.2",
        },
    ],
    [
        [".left-block .frame"],
        {
            opacity: [1, 0],
        },
        {
            duration: 0.4,
            ease: expoInOut,
            at: "-0.4",
        },
    ],
    [
        ".stripe",
        {
            x: ["0%", "145%"],
        },
        {
            duration: 1,
            ease: expoInOut,
            delay: stagger(0.05),
        },
    ],
    [
        ".right-block",
        {
            x: ["calc(0% - 0px)", "calc(-100% - 12px)"],
            scale: [1, 0.88, 1],
        },
        {
            duration: 1,
            ease: expoInOut,
        },
    ],
    [
        ".left-block",
        {
            x: ["calc(0% + 0px)", "calc(100% + 12px)"],
        },
        {
            duration: 1,
            ease: expoInOut,
            at: "-1",
        },
    ],
    [
        ".stripe",
        {
            x: ["145%", "0%"],
        },
        {
            duration: 1,
            ease: expoInOut,
            delay: stagger(0.05),
            at: "-1",
        },
    ],
    [
        ".cursor",
        {
            left: ["70%", "20%"],
        },
        {
            duration: 1,
            ease: expoInOut,
            at: "-1",
        },
    ],
]

const ORIGINS: ["left", "right"] = ["left", "right"]
const STRIPES = 4

export default function LandingLoopIntegration() {
    useEffect(() => {
        const controls = animate(sequence, {
            repeat: Infinity,
            repeatDelay: 0.5,
        })
        return () => controls.stop()
    }, [])

    return (
        <div
            role="presentation"
            aria-label="Integration"
            className="flex gap-3 h-full w-full relative"
        >
            <div
                className={cn(
                    "absolute flex z-3 flex-col top-1/2 -translate-y-1/2 gap-1.5 ml-[7%] w-[35%] h-[40%] [&>div]:bg-background",
                )}
            >
                {Array.from({ length: STRIPES }).map((_, index) => (
                    <div key={index} className="stripe w-full h-[38%] flex rounded-lg" />
                ))}
            </div>

            {ORIGINS.map((origin) => (
                <div
                    key={origin}
                    className={cn(
                        "relative bg-mat-4 rounded-lg h-full w-[50%] flex flex-col items-center justify-center",
                        {
                            "left-block z-2": origin === "left",
                            "right-block z-1": origin === "right",
                        },
                    )}
                >
                    <DashedFrame
                        className={cn("frame absolute inset-0 z-0 w-full h-full", {
                            "opacity-0": origin === "right",
                            "opacity-100": origin === "left",
                        })}
                    />
                </div>
            ))}

            <svg
                aria-label="Cursor"
                className="-rotate-45 z-3 cursor opacity-[1] absolute size-8 top-[45%] left-[20%]"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M23.8076 3.39941C23.8812 3.23344 24.1169 3.23344 24.1904 3.39941L42.5234 44.7549C42.5506 44.8162 42.5482 44.8559 42.542 44.8828C42.5342 44.9166 42.5131 44.9569 42.4756 44.9922C42.438 45.0275 42.3965 45.046 42.3623 45.0518C42.335 45.0563 42.295 45.0563 42.2354 45.0254L25.0156 36.0928C24.3778 35.7619 23.6193 35.7619 22.9814 36.0928L5.7627 45.0254C5.70304 45.0563 5.66303 45.0563 5.63574 45.0518C5.60158 45.046 5.55993 45.0274 5.52246 44.9922C5.48499 44.9569 5.46388 44.9166 5.45605 44.8828C5.44982 44.8559 5.4475 44.8162 5.47461 44.7549L23.8076 3.39941Z"
                    fill="var(--color-mat-1)"
                    stroke="light-dark(var(--color-background), var(--color-mat-4))"
                    strokeWidth="2"
                />
            </svg>
        </div>
    )
}
