"use client"

import { ChevronLeft, X } from "lucide-react"
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
import SideBarContent from "./SideBarContent"

type DocSidebarProps = {
    sections: DocTree[]
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

export default function SideBar({ sections }: DocSidebarProps) {
    const sideBarOpen = useGlobalStore((state) => state.sideBarOpen)
    const sheetSidebarOpen = useGlobalStore((state) => state.sheetSidebarOpen)
    const toggleSidebar = useGlobalStore((state) => state.toggleSidebar)
    const toggleSheetSidebar = useGlobalStore((state) => state.toggleSheetSidebar)
    const pathname = usePathname()

    useScrollLock(sheetSidebarOpen)

    useEffect(() => {
        useGlobalStore.setState({ sheetSidebarOpen: false })
    }, [pathname])

    return (
        <>
            {/* Desktop sidebar */}
            {sideBarOpen && (
                <SideBarContent
                    className="max-lg:hidden min-w-70 sticky top-sticky"
                    topBarSlot={
                        <div className="border-b h-under-nav-h flex items-center justify-between px-5 shrink-0">
                            <div>Docs {VERSION}</div>

                            <Button
                                aria-label="Close sidebar"
                                onClick={toggleSidebar}
                                size="icon"
                                variant="tertiary"
                            >
                                <ChevronLeft strokeWidth={1.5} />
                            </Button>
                        </div>
                    }
                    sections={sections}
                />
            )}

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
                            className="fixed z-51 xs:left-[1rem] xs:top-[1rem] left-0 top-0 h-full w-full xs:w-85"
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            <SideBarContent
                                sections={sections}
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
