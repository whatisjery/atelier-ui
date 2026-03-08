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
import { formatPlaceholderTitle, getLucideIcon } from "@/lib/utils"
import type { DocTree } from "@/types/docs"
import LandingScratchReveal from "./LandingScratchReveal"

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
            <div className="w-full h-full relative border flex overflow-hidden bg-background">
                <LandingScratchReveal containerRef={containerRef} />

                <div className="aspect-[2/4] h-full w-full relative">
                    <motion.div ref={mesureRef} style={{ y }} className="h-full w-full">
                        {[...col1, ...col1].map((item, index) => {
                            const Icon = getLucideIcon(item.icon)

                            return (
                                <CardGrid
                                    key={index}
                                    badge={item.status}
                                    focusable={false}
                                    placeholder={item.placeholder}
                                    className="border-b"
                                    href={item.url}
                                    title={formatPlaceholderTitle(item)}
                                    iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                    tags={item.tags}
                                />
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
                                <CardGrid
                                    key={index}
                                    badge={item.status}
                                    focusable={false}
                                    placeholder={item.placeholder}
                                    className="border-b"
                                    href={item.url}
                                    title={formatPlaceholderTitle(item)}
                                    iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                    tags={item.tags}
                                />
                            )
                        })}
                    </motion.div>
                    <DashedBorder
                        direction="vertical"
                        className="absolute top-0 right-0 bottom-0"
                    />
                    <DashedBorder direction="vertical" className="absolute top-0 left-0 bottom-0" />
                </div>

                <div className="aspect-[2/4] h-full w-full lg:block hidden">
                    <motion.div style={{ y }} className="h-full w-full">
                        {[...col3, ...col3].map((item, index) => {
                            const Icon = getLucideIcon(item.icon)
                            return (
                                <CardGrid
                                    key={index}
                                    badge={item.status}
                                    focusable={false}
                                    placeholder={item.placeholder}
                                    className="border-b"
                                    href={item.url}
                                    title={formatPlaceholderTitle(item)}
                                    iconSlot={<Icon strokeWidth={0.8} size={40} />}
                                    tags={item.tags}
                                />
                            )
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
