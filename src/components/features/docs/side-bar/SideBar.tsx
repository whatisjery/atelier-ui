"use client"

import { X } from "lucide-react"
import { AnimatePresence, motion, type Transition, type Variants } from "motion/react"
import { useEffect } from "react"
import BrandLink from "@/components/common/Brand"
import Button from "@/components/ui/Button"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { usePathname } from "@/i18n/navigation"
import { VERSION } from "@/lib/constants"
import { expoOut } from "@/lib/ease"
import { useGlobalStore } from "@/lib/store"
import type { DocTree } from "@/types/docs"
import SideBarContent, { type SideBarTool } from "./SideBarContent"

type DocSidebarProps = {
    sections: DocTree[]
    tools?: SideBarTool[]
    renderBadge?: (node: DocTree) => React.ReactNode
}

const transition: Transition = {
    ease: expoOut,
    duration: 0.4,
}

const panelVariants: Variants = {
    open: { x: 0, transition },
    closed: { x: "-105%", transition },
}

const backdropVariants: Variants = {
    open: { opacity: 1, transition },
    closed: { opacity: 0, transition },
}

export default function SideBar({ sections, tools, renderBadge }: DocSidebarProps) {
    const sheetSidebarOpen = useGlobalStore((state) => state.sheetSidebarOpen)
    const toggleSheetSidebar = useGlobalStore((state) => state.toggleSheetSidebar)
    const pathname = usePathname()

    useScrollLock(sheetSidebarOpen)

    useEffect(() => {
        useGlobalStore.setState({ sheetSidebarOpen: false })
    }, [pathname])

    return (
        <>
            {/* Desktop sidebar */}
            <SideBarContent
                className="max-lg:hidden min-w-70 sticky top-sticky"
                topBarSlot={
                    <div className="border-b h-under-nav-h flex items-center justify-between px-5 shrink-0">
                        Docs {VERSION}
                    </div>
                }
                sections={sections}
                tools={tools}
                renderBadge={renderBadge}
            />

            {/* Mobile sidebar */}
            <AnimatePresence>
                {sheetSidebarOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-50 bg-backdrop backdrop-blur-sm"
                            variants={backdropVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            onClick={toggleSheetSidebar}
                        />

                        <motion.div
                            key="panel"
                            className="fixed z-51 xs:left-4 xs:top-4 left-0 top-0 h-full w-full xs:w-85"
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            <SideBarContent
                                sections={sections}
                                tools={tools}
                                renderBadge={renderBadge}
                                className="xs:h-[calc(100vh-2rem)] h-screen xs:rounded-xl xs:border overflow-y-auto"
                                topBarSlot={
                                    <div className="flex p-4 h-nav-h border-b border-dashed items-center justify-between">
                                        <BrandLink />

                                        <Button
                                            aria-label="Close sidebar"
                                            onClick={toggleSheetSidebar}
                                            variant="primary"
                                            size="icon"
                                        >
                                            <X strokeWidth={1.5} className="size-5" />
                                        </Button>
                                    </div>
                                }
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
