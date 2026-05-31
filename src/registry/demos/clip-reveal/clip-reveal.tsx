"use client"

import { AnimatePresence, motion } from "motion/react"
import { useFakeLoader } from "@/hooks/use-fake-loader"
import { ClipReveal, type ClipRevealProps } from "@/registry/base/clip-reveal/clip-reveal"

export default function ClipRevealDemo(controls: Partial<ClipRevealProps>) {
    const { loaded, messageRef } = useFakeLoader()

    return (
        <div className="w-screen h-screen">
            <ClipReveal
                key={JSON.stringify(controls)}
                {...controls}
                className="w-full h-full bg-black"
                trigger={loaded}
            >
                <img
                    src="/images/demo/shared/1.webp"
                    alt="Hero"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center font-serif text-white text-6xl">
                    Atelier UI
                </span>
            </ClipReveal>

            <AnimatePresence>
                {!loaded && (
                    <motion.div
                        exit={{ opacity: 0, transition: { delay: 0.5 } }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[9999]"
                    >
                        <span ref={messageRef} className="font-serif text-white text-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
