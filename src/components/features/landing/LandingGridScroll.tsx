"use client"

import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useTransform,
    useVelocity,
} from "motion/react"
import { useRef } from "react"
import CardGrid from "@/components/ui/CardGrid"
import DashedBorder from "@/components/ui/DashedBorder"
import { getLucideIcon } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

const PER_COLUMN = 2
const DEFAULT_DASH = 4
const DEFAULT_GAP = 4

type LandingGridScrollProps = {
    items: DocTree[]
}

export default function LandingGridScroll({ items }: LandingGridScrollProps) {
    const [col1, col2, col3] = [
        items.slice(0, PER_COLUMN),
        items.slice(PER_COLUMN, PER_COLUMN * 2),
        items.slice(PER_COLUMN * 2, PER_COLUMN * 3),
    ]

    const y = useMotionValue(0)
    const mesureRef = useRef<React.ComponentRef<"div">>(null)
    const containerRef = useRef<React.ComponentRef<"div">>(null)
    const yReversed = useTransform(y, (v) => -v)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const scrollInfluenceRef = useRef(0)

    useAnimationFrame((_, delta) => {
        if (!mesureRef.current) return

        const targetInfluence = scrollVelocity.get() * 0.002
        scrollInfluenceRef.current += (targetInfluence - scrollInfluenceRef.current) * 0.05

        y.set(y.get() - delta * 0.018 - Math.abs(scrollInfluenceRef.current))

        if (mesureRef.current.offsetHeight < Math.abs(y.get())) {
            y.set(0)
        }
    })

    return (
        <div ref={containerRef} className="w-full h-full p-5 text-2xl capitalize z-2 relative">
            <div className="w-full h-full relative flex overflow-hidden bg-background">
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
                        strokeWidth="2"
                        strokeDasharray={`${DEFAULT_DASH} ${DEFAULT_GAP}`}
                        className="text-mat-3"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-24"
                            dur="0.8s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </svg>

                <div className="aspect-[2/4] h-full w-full relative">
                    <motion.div ref={mesureRef} style={{ y }} className="h-full w-full">
                        {[...col1, ...col1].map((item, index) => {
                            const Icon = getLucideIcon(item.icon)

                            return (
                                <div className="relative w-full" key={index}>
                                    <CardGrid
                                        key={index}
                                        badge={item.status}
                                        focusable={false}
                                        href={item.url}
                                        title={item.title}
                                        iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                        tags={item.tags}
                                    />
                                    <DashedBorder
                                        direction="horizontal"
                                        className="absolute top-0 w-full text-mat-3"
                                    />
                                </div>
                            )
                        })}
                    </motion.div>
                </div>

                <div className="aspect-[2/4] h-full w-full relative sm:block hidden">
                    <motion.div
                        style={{ y: yReversed }}
                        className="h-full w-full relative bottom-[100%]"
                    >
                        {[...col2, ...col2].map((item, index) => {
                            const Icon = getLucideIcon(item.icon)
                            return (
                                <div className="relative w-full" key={index}>
                                    <CardGrid
                                        key={index}
                                        badge={item.status}
                                        focusable={false}
                                        href={item.url}
                                        title={item.title}
                                        iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                        tags={item.tags}
                                    />
                                    <DashedBorder
                                        direction="horizontal"
                                        className="absolute top-0 w-full text-mat-3"
                                    />
                                </div>
                            )
                        })}
                    </motion.div>
                    <DashedBorder
                        direction="vertical"
                        className="absolute top-0 right-0 bottom-0 text-mat-3"
                    />
                    <DashedBorder
                        direction="vertical"
                        className="absolute top-0 left-0 bottom-0 text-mat-3"
                    />
                </div>

                <div className="aspect-[2/4] h-full w-full lg:block hidden">
                    <motion.div style={{ y }} className="h-full w-full">
                        {[...col3, ...col3].map((item, index) => {
                            const Icon = getLucideIcon(item.icon)
                            return (
                                <div className="relative w-full" key={index}>
                                    <CardGrid
                                        badge={item.status}
                                        focusable={false}
                                        href={item.url}
                                        title={item.title}
                                        iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                        tags={item.tags}
                                    />
                                    <DashedBorder
                                        direction="horizontal"
                                        className="absolute top-0 w-full text-mat-3"
                                    />
                                </div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
