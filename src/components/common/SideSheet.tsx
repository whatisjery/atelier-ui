"use client"

import { AnimatePresence, motion, type Transition, type Variants } from "motion/react"
import { expoOut } from "@/lib/ease"
import { cn } from "@/lib/utils"

const transition: Transition = {
    ease: expoOut,
    duration: 0.4,
}

const backdropVariants: Variants = {
    open: { opacity: 1, transition },
    closed: { opacity: 0, transition },
}

const panelVariants: Record<"left" | "right", Variants> = {
    left: {
        open: { x: 0, transition },
        closed: { x: "-105%", transition },
    },
    right: {
        open: { x: 0, transition },
        closed: { x: "105%", transition },
    },
}

type SideSheetProps = {
    open: boolean
    onClose: () => void
    side?: "left" | "right"
    backdrop?: boolean
    children: React.ReactNode
}

export default function SideSheet({
    open,
    onClose,
    side = "left",
    backdrop = true,
    children,
}: SideSheetProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {backdrop && (
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-50 bg-backdrop backdrop-blur-sm"
                            variants={backdropVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            onClick={onClose}
                        />
                    )}

                    <motion.div
                        key="panel"
                        variants={panelVariants[side]}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className={cn(
                            "fixed z-51 top-0 xs:top-4 h-full w-full xs:w-85",
                            side === "left" ? "left-0 xs:left-4" : "right-0 xs:right-4",
                        )}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
