"use client"

import { AnimatePresence, motion } from "motion/react"
import { useFakeLoader } from "@/hooks/use-fake-loader"
import { StripeWipe, type StripeWipeProps } from "@/registry/base/stripe-wipe/stripe-wipe"

export default function StripeWipeDemo(controls: Partial<StripeWipeProps>) {
    const { loaded, messageRef } = useFakeLoader()

    return (
        <div className="w-screen h-screen">
            <img
                src="/images/demo/shared/1.webp"
                alt="Hero"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <span className="absolute inset-0 flex items-center justify-center font-serif text-white text-6xl">
                Atelier UI
            </span>

            <StripeWipe
                key={JSON.stringify(controls)}
                {...controls}
                trigger={loaded}
                className="pointer-events-none absolute inset-0 h-full w-full"
            />

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
