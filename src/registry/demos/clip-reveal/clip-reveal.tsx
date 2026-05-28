"use client"

import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import Button from "@/components/ui/Button"
import { useFakeLoader } from "@/hooks/use-fake-loader"
import { ClipReveal, type ClipRevealProps } from "@/registry/base/clip-reveal/clip-reveal"

export default function ClipRevealDemo(controls: Partial<ClipRevealProps>) {
    const { loaded, messageRef } = useFakeLoader()

    return (
        <div className="relative w-full h-screen">
            <ClipReveal {...controls} className="w-full h-full bg-black" trigger={loaded}>
                <div className="relative w-full h-full">
                    <Image
                        src="/images/demo/shared/3.webp"
                        alt="Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => window.location.reload()}
                            className="font-serif text-white text-6xl tracking-tight h-auto px-0"
                        >
                            Replay
                        </Button>
                    </div>
                </div>
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
