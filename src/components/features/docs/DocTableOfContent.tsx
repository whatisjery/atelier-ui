"use client"

import { ArrowUpRight, Bug, Pen, Star } from "lucide-react"
import { motion, useSpring } from "motion/react"
import { useLocale, useTranslations } from "next-intl"
import { useLayoutEffect, useRef, useState } from "react"
import DashedBorder from "@/components/ui/DashedBorder"
import { Link, usePathname } from "@/i18n/navigation"
import { REPO_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { DocHeading } from "@/types/docs"

type DocTableOfContentProps = {
    headings: DocHeading[]
    showCommunityLinks?: boolean
}

const EDIT_PATH_OVERRIDES: Record<string, string> = {
    "/docs": "src/content/en/index.mdx",
} as const

function getEditUrl(pathname: string, locale: string) {
    const override = EDIT_PATH_OVERRIDES[pathname]
    const filePath = override ?? `src/content/${locale}${pathname.replace("/docs", "")}.mdx`
    return `${REPO_URL}/edit/main/${encodeURI(filePath)}`
}

function getCommunityLinks(editUrl: string) {
    return [
        {
            key: "star-this-project",
            href: REPO_URL,
            icon: <Star size={15} opacity={0.6} />,
        },

        {
            key: "create-an-issue",
            href: `${REPO_URL}/issues`,
            icon: <Bug size={15} opacity={0.6} />,
        },
        {
            key: "edit-this-page",
            href: editUrl,
            icon: <Pen size={15} opacity={0.6} />,
        },
    ]
}

export default function DocTableOfContent({
    headings,
    showCommunityLinks = true,
}: DocTableOfContentProps) {
    const t = useTranslations("docs.toc")
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map())
    const top = useSpring(0, { stiffness: 500, damping: 40 })
    const isFirstRender = useRef(true)
    const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null)
    const pathname = usePathname()
    const locale = useLocale()
    const editUrl = getEditUrl(pathname, locale)

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
        if (level === 2) return "0rem"
        if (level === 3) return "0.5rem"
        if (level === 4) return "1rem"
        if (level === 5) return "1.5rem"
        return "0rem"
    }

    return (
        <div className="flex-col justify-between h-full pl-8 w-full relative">
            {headings.length > 0 && (
                <h5 className="text-sm text-mat-1 font-semibold block mb-4">{t("on-this-page")}</h5>
            )}

            <div className="absolute z-10 left-0 bottom-0 w-full h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            <div className="pl-1 overflow-y-auto scrollbar-overlay h-[calc(100vh-12rem)] pb-20">
                {headings.length > 0 && (
                    <ul className="space-y-2.5 mb-10 relative pl-6">
                        <motion.div
                            style={{ top }}
                            className="absolute mt-[0.35rem] -left-[0.25rem] w-2.5 h-2.5 border border-highlight/80 bg-background z-10"
                        />

                        <DashedBorder
                            direction="vertical"
                            className="left-0 absolute bottom-0 top-0 h-full text-highlight/40"
                        />

                        {headings.map((heading) => (
                            <li
                                style={{
                                    marginLeft: `${levelMargin(heading.level)}`,
                                }}
                                key={heading.id}
                                ref={(el) => {
                                    if (el) itemRefs.current.set(heading.id, el)
                                    else itemRefs.current.delete(heading.id)
                                }}
                            >
                                <Link
                                    href={`#${heading.id}`}
                                    className={cn("transition-colors text-mat-2 hover:text-mat-1", {
                                        "text-highlight font-medium": activeId === heading.id,
                                    })}
                                >
                                    {heading.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {showCommunityLinks && (
                    <>
                        <h5 className="mb-4 text-sm font-semibold flex">Community</h5>

                        <nav className="space-y-2.5">
                            {getCommunityLinks(editUrl).map(({ key, href, icon }) => {
                                return (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={key}
                                        className="flex items-center gap-2 text-mat-2 hover:text-mat-1"
                                        href={href}
                                    >
                                        {icon}

                                        <span className="flex items-start">
                                            {t(key)}
                                            <ArrowUpRight className="size-3" />
                                        </span>
                                    </a>
                                )
                            })}
                        </nav>
                    </>
                )}
            </div>
        </div>
    )
}
