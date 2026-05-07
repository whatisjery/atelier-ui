"use client"

import { Folder, FolderOpen } from "lucide-react"
import {
    type MotionValue,
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useTransform,
    useVelocity,
} from "motion/react"
import Link from "next/link"
import React, { type ComponentRef, useRef } from "react"
import Border from "@/components/ui/Border"
import GridPattern from "@/components/ui/GridPattern"
import ScrollingMarquee from "@/components/ui/ScrollingMarquee"
import { cn } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

type LandingGridScrollProps = {
    items: DocTree[]
}

type ColumnProps = {
    items: DocTree[]
    y: MotionValue<number>
    className?: string
    reversed?: boolean
    measureRef?: React.Ref<HTMLDivElement>
}

const NUMBER_OF_COLUMN = 3
const ITEMS_PER_COLUMN = 2

function Column({ items, y, className, reversed, measureRef }: ColumnProps) {
    return (
        <div className={cn("aspect-[2/4] h-full w-full relative", className)}>
            <motion.div
                ref={measureRef}
                style={{ y }}
                className={cn("h-full w-full", {
                    "relative bottom-[100%]": reversed,
                })}
            >
                {[...items, ...items].map((item, index) => {
                    return (
                        <Link
                            key={index}
                            href={item.url}
                            className="flex group flex-col relative items-center justify-center aspect-square border-b w-full group cursor-pointer gap-y-3"
                        >
                            <GridPattern />

                            <Folder className="group-hover:hidden" strokeWidth={0.7} size={40} />
                            <FolderOpen
                                className="hidden group-hover:block"
                                strokeWidth={0.7}
                                size={40}
                            />

                            <h3 className="font-serif italic whitespace-nowrap text-4xl flex items-center">
                                {item.title}
                            </h3>

                            <ScrollingMarquee
                                fadeOnEachSide
                                speed={10}
                                className="w-[20rem] h-fit text-xs italic"
                            >
                                {item.tags?.map((tag, index) => (
                                    <React.Fragment key={index}>
                                        <div className="uppercase">{tag}</div>

                                        <span className="px-1 font-sans">&nbsp;&mdash;&nbsp;</span>
                                    </React.Fragment>
                                ))}
                            </ScrollingMarquee>
                        </Link>
                    )
                })}
            </motion.div>
        </div>
    )
}

export default function LandingGridScroll({ items }: LandingGridScrollProps) {
    const [col1, col2, col3] = Array.from({ length: NUMBER_OF_COLUMN }, (_, i) =>
        items.slice(i * ITEMS_PER_COLUMN, (i + 1) * ITEMS_PER_COLUMN),
    )
    const y = useMotionValue(0)
    const yReversed = useTransform(y, (v) => -v)
    const measureRef = useRef<ComponentRef<"div">>(null)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const scrollRef = useRef(0)
    const directionRef = useRef<1 | -1>(-1)

    useAnimationFrame((_, delta) => {
        if (!measureRef.current) return
        const height = measureRef.current.offsetHeight
        const velocity = scrollVelocity.get()

        if (Math.abs(velocity) > 50) {
            directionRef.current = velocity > 0 ? -1 : 1
        }

        scrollRef.current += (Math.abs(velocity) * 0.002 - scrollRef.current) * 0.05
        const next = y.get() + (delta * 0.018 + scrollRef.current) * directionRef.current

        y.set(next)

        if (next <= -height) y.set(0)
        if (next >= 0) y.set(-height + 1)
    })

    return (
        <section className="w-full h-full text-2xl z-2 relative">
            <Border direction="horizontal" className="bottom-0" />
            <div className="w-full h-full relative flex overflow-hidden bg-bg">
                <Column items={col1} y={y} measureRef={measureRef} className="border-r border-l" />
                <Column
                    items={col2}
                    y={yReversed}
                    className="border-r hidden sm:block"
                    reversed={true}
                />
                <Column items={col3} y={y} className="border-r hidden lg:block" />
            </div>
        </section>
    )
}
