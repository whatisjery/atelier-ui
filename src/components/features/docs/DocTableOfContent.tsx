"use client"

import { useSpring } from "motion/react"
import { useLayoutEffect, useRef, useState } from "react"
import ListItem from "@/components/ui/ListItem"
import type { DocHeading } from "@/types/docs"

type DocTableOfContentProps = {
    headings: DocHeading[]
}

export default function DocTableOfContent({ headings }: DocTableOfContentProps) {
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
    const top = useSpring(0, { stiffness: 500, damping: 40 })
    const isFirstRender = useRef(true)
    const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null)

    useLayoutEffect(() => {
        const handleScroll = () => {
            const firstEl = document.getElementById(headings[0]?.id)
            const offset = firstEl ? parseFloat(getComputedStyle(firstEl).scrollMarginTop) : 0
            let currentActiveId = headings[0]?.id

            for (const heading of headings) {
                const el = document.getElementById(heading.id)

                // browsers round pixel values slightly differently, +2 prevents the wrong heading from being selected
                if (el && el.getBoundingClientRect().top <= offset + 2) {
                    currentActiveId = heading.id
                }
            }

            setActiveId(currentActiveId)
        }

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [headings])

    useLayoutEffect(() => {
        if (!activeId) return

        const activeItem = itemRefs.current.get(activeId)

        if (!activeItem) return

        const newTop = activeItem.offsetTop

        if (isFirstRender.current) {
            top.jump(newTop)
            isFirstRender.current = false
        } else {
            top.set(newTop)
        }
    }, [activeId, top])

    const levelMargin = (level: number) => {
        if (level === 2) return "pl-5"
        if (level === 3) return "pl-7.5"
        if (level === 4) return "pl-10"
        return "0rem"
    }

    return (
        <div className="flex-col justify-between w-full relative">
            <div className="absolute z-10 left-0 bottom-0 w-full h-20 bg-gradient-to-t from-bg to-transparent pointer-events-none" />

            <div className="overflow-y-auto scrollbar-overlay pb-20">
                {headings.length > 0 && (
                    <ul className="mb-10 relative">
                        {headings.map((heading) => (
                            <ListItem
                                ref={(el) => {
                                    if (el) itemRefs.current.set(heading.id, el)
                                    else itemRefs.current.delete(heading.id)
                                }}
                                className={levelMargin(heading.level)}
                                key={heading.id}
                                sideLine
                                linkItem={{ href: `#${heading.id}`, label: heading.text }}
                                activeItem={activeId === heading.id}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
