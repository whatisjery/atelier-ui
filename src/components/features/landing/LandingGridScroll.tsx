"use client"

import { Folder, FolderOpen } from "lucide-react"

import Link from "next/link"
import React from "react"
import Border from "@/components/ui/Border"
import GridPattern from "@/components/ui/GridPattern"
import ScrollingMarquee from "@/components/ui/ScrollingMarquee"

import { InfiniteParallax } from "@/registry/base/infinite-parallax/infinite-parallax"
import type { DocTree } from "@/types/docs"

type LandingGridScrollProps = {
    items: DocTree[]
}

const Item = ({ item }: { item: DocTree }) => {
    return (
        <Link
            href={item.url}
            className="flex group flex-col relative items-center justify-center aspect-square border-b w-full group cursor-pointer gap-y-3"
        >
            <GridPattern />

            <Folder className="group-hover:hidden" strokeWidth={0.7} size={40} />
            <FolderOpen className="hidden group-hover:block" strokeWidth={0.7} size={40} />

            <h3 className="font-serif italic whitespace-nowrap text-4xl flex items-center">
                {item.title}
            </h3>

            <ScrollingMarquee fadeOnEachSide speed={10} className="w-[20rem] h-fit text-xs italic">
                {item.tags?.map((tag, index) => (
                    <React.Fragment key={index}>
                        <div className="uppercase">{tag}</div>

                        <span className="px-1 font-sans">&nbsp;&mdash;&nbsp;</span>
                    </React.Fragment>
                ))}
            </ScrollingMarquee>
        </Link>
    )
}

export default function LandingGridScroll({ items }: LandingGridScrollProps) {
    const [col1, col2, col3] = Array.from({ length: 3 }, (_, i) => items.slice(i * 2, (i + 1) * 2))

    return (
        <section className="w-full h-full text-2xl z-2 relative">
            <Border direction="horizontal" className="bottom-0" />
            <div className="w-full h-full relative flex overflow-hidden bg-bg">
                <div className="aspect-2/4 h-full w-full relative border-r border-l">
                    <InfiniteParallax>
                        {col1.map((item, index) => (
                            <Item key={index} item={item} />
                        ))}
                    </InfiniteParallax>
                </div>

                <div className="aspect-2/4 h-full w-full relative border-r hidden sm:block">
                    <InfiniteParallax reversed>
                        {col2.map((item, index) => (
                            <Item key={index} item={item} />
                        ))}
                    </InfiniteParallax>
                </div>

                <div className="aspect-2/4 h-full w-full relative border-r hidden lg:block">
                    <InfiniteParallax>
                        {col3.map((item, index) => (
                            <Item key={index} item={item} />
                        ))}
                    </InfiniteParallax>
                </div>
            </div>
        </section>
    )
}
