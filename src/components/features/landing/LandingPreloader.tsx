import { AnimatePresence, motion } from "motion/react"
import Logo from "@/components/common/Logo"
import { BRAND } from "@/lib/constants"
import { expoInOut, expoOut } from "@/lib/ease"

type LandingPreloaderProps = {
    isLoaded: boolean
}

export default function LandingPreloader({ isLoaded }: LandingPreloaderProps) {
    return (
        <AnimatePresence>
            {!isLoaded && (
                <motion.div
                    key="loading"
                    className="h-screen pb-[5vh] w-screen flex flex-col items-center justify-center fixed top-0 left-0 z-[999] bg-bg"
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: expoOut }}
                >
                    <span className="text-4xl font-serif flex items-center mb-5">
                        <Logo className="mb-1 mr-2" size={32} />
                        {BRAND}
                    </span>

                    <span className="relative w-[11rem] h-px bg-accent-3">
                        <motion.span
                            className="absolute origin-left w-full h-full bg-accent-1"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: [0, 1] }}
                            transition={{ duration: 0.8, ease: expoInOut }}
                        />
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
