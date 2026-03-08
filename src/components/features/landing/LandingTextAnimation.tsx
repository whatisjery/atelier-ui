"use client"

import { motion, useScroll, useSpring, useTransform } from "motion/react"
import { useRef } from "react"
import Border from "@/components/ui/Border"
import DashedFrame from "@/components/ui/DashedFrame"
import { Link } from "@/i18n/navigation"

const MotionLink = motion.create(Link)

export default function LandingTextAnimation() {
    const scrollContainerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start end", "start 0.2"],
    })
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 300,
        damping: 40,
        restDelta: 0.001,
    })
    const clipPath = useTransform(
        smoothProgress,
        [0, 0.5, 1],
        ["inset(50% 50% 50% 50%)", "inset(25% 35% 25% 35%)", "inset(0% 0% 0% 0%)"],
    )
    const width = useTransform(smoothProgress, [0, 0.5, 1], ["0%", "30%", "100%"])
    const height = useTransform(smoothProgress, [0, 0.5, 1], ["0%", "50%", "100%"])
    const blur = useTransform(smoothProgress, [0, 1], ["blur(10px)", "blur(0px)"])
    const opacity = useTransform(smoothProgress, [0, 1], [0, 1])
    const scale = useTransform(smoothProgress, [0, 1], [1.2, 1])

    return (
        <div
            ref={scrollContainerRef}
            className="w-full relative h-200 flex items-center justify-center p-5 stripped-pattern"
        >
            <Border direction="horizontal" className="bottom-0" />
            <div className="relative w-full h-full flex items-center justify-center">
                <MotionLink href={"/docs"} style={{ width, height }} className="absolute z-3">
                    <DashedFrame fillHandles />
                </MotionLink>

                <motion.div
                    style={{ clipPath }}
                    className="w-full h-full flex items-center justify-center overflow-hidden bg-background"
                >
                    <motion.h3
                        style={{ scale }}
                        className="lg:text-7xl mb-10 text-5xl text-center font-serif italic"
                    >
                        <span className="block text-center">
                            <span>Build beautiful </span>

                            <motion.span
                                style={{ filter: blur, opacity }}
                                className="inline-flex items-center gap-1"
                            >
                                handcrafted
                            </motion.span>
                        </span>

                        <span>animations in seconds.</span>
                    </motion.h3>
                </motion.div>
            </div>
        </div>
    )
}
