"use client"

import { BookOpen, ChevronRight, Layers2, X } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import BrandLink from "@/components/common/BrandLink"
import ThemeToggle from "@/components/common/ThemeToggle"
import Button from "@/components/ui/Button"
import DashedBorder from "@/components/ui/DashedBorder"
import { Link, usePathname } from "@/i18n/navigation"
import { VERSION } from "@/lib/constants"
import { expoOut } from "@/lib/easing"
import { useGlobalStore } from "@/lib/store"
import { cn, formatComponentNumber } from "@/lib/utils"
import type { DocTree } from "@/types/docs"
import DocSidebarTempSelect from "./DocSidebarTempSelect"

type SideBarCoreProps = {
    className: string
    menuSections: DocTree[]
    headerSlot?: React.ReactNode
    activeComponentCount: number
}

type DocSidebarProps = {
    menuSections: DocTree[]
    activeComponentCount: number
}

const MotionButton = motion.create(Button)

const TOP_LINKS = [
    {
        href: "/docs",
        icon: <BookOpen className="size-4 text-mat-1" />,
        key: "atelier-ui-docs",
        descriptionKey: "version",
        params: { version: VERSION },
    },
    {
        href: "/docs/components",
        icon: <Layers2 className="size-4 text-mat-1" />,
        key: "components",
        descriptionKey: "explore-components",
        params: undefined,
    },
] as const

const transition = {
    ease: expoOut,
    duration: 0.4,
}

const panelVariants: Variants = {
    open: {
        x: 0,
        transition,
    },
    closed: {
        x: "-105%",
        transition,
    },
}

const opacityVariants: Variants = {
    open: {
        opacity: 1,
        transition,
    },
    closed: {
        opacity: 0,
        transition,
    },
}

function SideBarCore({
    className,
    menuSections,
    headerSlot,
    activeComponentCount,
}: SideBarCoreProps) {
    const tCommon = useTranslations("common")
    const pathname = usePathname()

    return (
        <aside
            className={cn(
                "bg-background overflow-hidden relative max-h-[92vh] lg:max-h-aside-h scrollbar-overlay",
                className,
            )}
        >
            {headerSlot && headerSlot}

            <div>
                {TOP_LINKS.map(({ href, icon, key, descriptionKey, params }) => {
                    const isActive = pathname === href

                    return (
                        <Link
                            key={key}
                            className={cn(
                                "flex items-center gap-x-2 hover:bg-mat-5/80 px-2 py-3 leading-4.5 rounded-xl",
                                {
                                    "bg-mat-5 hover:bg-mat-4/80": isActive,
                                },
                            )}
                            href={href}
                        >
                            <span className="border p-2 rounded-md bg-background border-mat-3/80">
                                {icon}
                            </span>

                            <div className="flex items-center justify-between w-full">
                                <span>
                                    <span className="font-medium text-sm">{tCommon(key)}</span>
                                    {key === "components" && (
                                        <sup className="ml-1 font-mono text-[0.65rem]">
                                            {formatComponentNumber(activeComponentCount)}
                                        </sup>
                                    )}
                                    <p className="text-xs text-mat-2">
                                        {tCommon(descriptionKey, params)}
                                    </p>
                                </span>

                                <ChevronRight
                                    strokeWidth={2}
                                    className={cn(
                                        "size-4",
                                        isActive ? "text-highlight" : "text-mat-3",
                                    )}
                                />
                            </div>
                        </Link>
                    )
                })}
            </div>
            <nav
                aria-label="Documentation"
                className="space-y-5 text-sm pl-2 overflow-y-auto scrollbar-overlay h-[calc(100vh-19rem)] pb-20"
            >
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="font-medium mb-1 text-mat-1">{section.category}</h3>

                        <ul className="pl-2 ml-1 relative">
                            <DashedBorder
                                direction="vertical"
                                className="left-0 absolute bottom-0 top-0 h-full text-mat-3/80"
                            />
                            {section.children.map((child) => {
                                if (child.title === "index") return null
                                const isActive = pathname === child.url

                                return (
                                    <li key={child.title}>
                                        <Link
                                            className={cn(
                                                "py-1.5 px-2 hover:text-mat-1 rounded-md w-full flex items-center justify-between text-mat-2",
                                                {
                                                    "text-highlight font-medium": isActive,
                                                },
                                            )}
                                            href={child.url}
                                        >
                                            {child.title}
                                            {isActive && (
                                                <ChevronRight className="size-4 !text-highlight" />
                                            )}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    )
}

export default function DocSidebar({ menuSections, activeComponentCount }: DocSidebarProps) {
    const isSidebarOpen = useGlobalStore((state) => state.isSidebarOpen)
    const toggleSidebar = useGlobalStore((state) => state.toggleSidebar)
    const pathname = usePathname()

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        return () => {
            document.body.style.overflow = ""
        }
    }, [isSidebarOpen])

    useEffect(() => {
        useGlobalStore.setState({ isSidebarOpen: false })
    }, [pathname])

    return (
        <>
            {/* Desktop sidebar */}
            <SideBarCore
                activeComponentCount={activeComponentCount}
                className="lg:block hidden min-w-75 sticky space-y-7 pl-3 top-offset-top"
                menuSections={menuSections}
            />

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-50 bg-backdrop backdrop-blur-sm"
                            variants={opacityVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            onClick={toggleSidebar}
                        />

                        <motion.div
                            key="panel"
                            className="fixed z-51 left-0 top-0 h-[calc(100vh-2rem)] bg-background max-w-[calc(100%-5rem)] w-85 p-3 rounded-2xl m-3 space-y-7"
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            <SideBarCore
                                activeComponentCount={activeComponentCount}
                                className="space-y-7"
                                menuSections={menuSections}
                                headerSlot={
                                    <div className="space-y-6 mb-5">
                                        <div className="flex items-center justify-between">
                                            <BrandLink />
                                            <ThemeToggle />
                                        </div>

                                        <DocSidebarTempSelect />
                                    </div>
                                }
                            />
                        </motion.div>

                        <MotionButton
                            variants={opacityVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            onClick={toggleSidebar}
                            size="icon"
                            className="z-50 bg-background size-8 fixed right-3 top-3 rounded-full"
                        >
                            <X className="size-4" />
                        </MotionButton>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
