"use client"

import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useTransform,
    useVelocity,
} from "motion/react"
import { type ComponentRef, useRef } from "react"
import CardGrid from "@/components/ui/CardGrid"
import DashedBorder from "@/components/ui/DashedBorder"
import { getLucideIcon } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

const PER_COLUMN = 2

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
    const mesureRef = useRef<ComponentRef<"div">>(null)
    const containerRef = useRef<ComponentRef<"div">>(null)
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
        <div ref={containerRef} className="w-full h-full text-2xl capitalize z-2 relative">
            <div className="w-full h-full relative flex overflow-hidden bg-background">
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
