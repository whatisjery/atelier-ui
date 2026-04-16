"use client"

import { ArrowRight, Layers2, X } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import BrandLink from "@/components/common/BrandLink"
import ThemeToggle from "@/components/common/ThemeToggle"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { Link, usePathname } from "@/i18n/navigation"
import { expoOut } from "@/lib/easing"
import { useGlobalStore } from "@/lib/store"
import { cn, formatComponentNumber } from "@/lib/utils"
import type { DocTree } from "@/types/docs"

type SideBarCoreProps = {
    className: string
    menuSections: DocTree[]
    headerSlot?: React.ReactNode
    activeComponentCount: number
    hasLicense: boolean
}

type DocSidebarProps = {
    menuSections: DocTree[]
    activeComponentCount: number
    hasLicense: boolean
}

const MotionButton = motion.create(Button)

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
    hasLicense,
}: SideBarCoreProps) {
    const tCommon = useTranslations("common")
    const pathname = usePathname()
    const isActive = pathname === "/docs"

    return (
        <aside className={cn("relative h-full", className)}>
            {headerSlot && headerSlot}

            <Link
                className={cn(
                    "flex border group mb-0 border-dashed items-center hover:bg-mat-5/50 gap-x-2 px-4 py-3 rounded-md",
                    {
                        "bg-mat-5/50": isActive,
                    },
                )}
                href="/docs"
            >
                <span
                    className={cn("border p-2 rounded-md bg-mat-5/50 group-hover:bg-background", {
                        "bg-background": isActive,
                    })}
                >
                    <Layers2 className="size-4 text-mat-1" />
                </span>

                <div className="flex items-center justify-between w-full leading-4.5">
                    <div>
                        <span className="font-medium text-sm">{tCommon("components")}</span>

                        <sup className="ml-1 font-mono text-[0.65rem]">
                            {formatComponentNumber(activeComponentCount)}
                        </sup>

                        <p className="text-xs text-mat-2">{tCommon("explore-components")}</p>
                    </div>

                    <AnimatedArrow
                        className={isActive ? "text-mat-1" : "text-mat-3"}
                    ></AnimatedArrow>
                </div>
            </Link>

            <nav
                aria-label="Documentation"
                className="space-y-5 text-sm pl-2 pt-5 pb-20 h-[calc(100vh-11rem)] overflow-y-auto scrollbar-overlay"
            >
                {menuSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="font-medium mb-1 text-mat-1">{section.category}</h3>

                        <ul className="px-2 ml-1 relative border-l">
                            {section.children.map((child) => {
                                if (child.title === "index") return null
                                const isActive = pathname === child.url

                                return (
                                    <li key={child.title}>
                                        <Link
                                            className={cn(
                                                "py-1 group px-2 hover:text-mat-1 rounded-md w-full flex items-center justify-between text-mat-2",
                                                {
                                                    "text-highlight font-medium": isActive,
                                                },
                                            )}
                                            href={child.url}
                                        >
                                            <span className="flex items-center gap-x-2">
                                                {child.title}

                                                {child.pro && !hasLicense && (
                                                    <Badge title="pro" variant="neutral" />
                                                )}
                                            </span>

                                            <ArrowRight
                                                className={cn(
                                                    "size-4 opacity-0 -translate-x-1 transition duration-300",
                                                    {
                                                        "opacity-100 translate-x-0": isActive,
                                                    },
                                                )}
                                            />
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

export default function DocSidebar({
    menuSections,
    activeComponentCount,
    hasLicense,
}: DocSidebarProps) {
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
                className="max-xl:hidden min-w-70 sticky space-y-7 pl-3 top-sticky"
                menuSections={menuSections}
                hasLicense={hasLicense}
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
                            className="fixed z-51 left-0 top-0 h-[calc(100vh-2rem)] overflow-hidden bg-background max-w-[calc(100%-5rem)] w-85 p-3 rounded-2xl m-3 space-y-7"
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            <SideBarCore
                                activeComponentCount={activeComponentCount}
                                className="space-y-7"
                                menuSections={menuSections}
                                hasLicense={hasLicense}
                                headerSlot={
                                    <div className="flex items-center justify-between">
                                        <BrandLink />
                                        <ThemeToggle />
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
