"use client"

import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import Border from "@/components/ui/Border"
import { Link } from "@/i18n/navigation"

const DEFAULT_DASH = 4
const DEFAULT_GAP = 4
const MAX_CLIP = 0.9

const MotionLink = motion.create(Link)

export default function LandingClipReveal() {
    const scrollContainerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start end", "start -200px"],
    })

    const a = useTransform(scrollYProgress, [0, MAX_CLIP], [50, 50 - 50 * MAX_CLIP])
    const b = useTransform(scrollYProgress, [0, MAX_CLIP], [50, 50 + 50 * MAX_CLIP])
    const size = useTransform(scrollYProgress, [0, MAX_CLIP], ["0%", `${MAX_CLIP * 100}%`])
    const clipPath = useMotionTemplate`polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0,
    ${a}% ${a}%, ${a}% ${b}%, ${b}% ${b}%, ${b}% ${a}%, ${a}% ${a}%, 0 0)`

    return (
        <div className="w-full relative h-220 bg-bg/90 border-r border-l">
            <Border direction="horizontal" className="bottom-0" />
            <motion.div
                ref={scrollContainerRef}
                style={{ clipPath }}
                className="w-full h-full bg-bg pattern-line relative z-2"
            />

            <h2 className="absolute w-full font-serif text-center italic text-7xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1">
                Hammered with precision.
            </h2>

            <MotionLink
                href="/docs"
                style={{ width: size, height: size }}
                className="absolute will-change-contents top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-3"
            >
                <div className="flex absolute inset-0 z-2 justify-between w-full h-full">
                    <div className="flex flex-col justify-between h-full [&>div]:relative [&>div]:bg-theme-bg">
                        <div className="handle w-2.5 h-2.5 right-1 bottom-1 bg-bg border-theme-bg border" />
                        <div className="handle w-2.5 h-2.5 right-1 -bottom-1 bg-bg border-theme-bg border" />
                    </div>
                    <div className="flex flex-col justify-between h-full [&>div]:relative [&>div]:bg-theme-bg ">
                        <div className="handle w-2.5 h-2.5 -right-1 -top-1 bg-bg border-theme-bg border" />
                        <div className="handle w-2.5 h-2.5 -right-1 top-1 bg-bg border-theme-bg border" />
                    </div>
                </div>
                <svg
                    aria-label="Dashed Frame"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <rect
                        width="100"
                        height="100"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${DEFAULT_DASH} ${DEFAULT_GAP}`}
                        className="text-theme"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-24"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </svg>
            </MotionLink>
        </div>
    )
}
