"use client"

import { ArrowRight } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { expoOut } from "@/lib/easing"
import { formatComponentNumber } from "@/lib/utils"

const BORDER_WIDTH = 1
const DASH_LENGTH = 6
const DASH_GAP = 4
const DASH_TOTAL = DASH_LENGTH + DASH_GAP
const DURATION = 1.5

const rectVariants: Variants = {
    rest: { strokeDasharray: `${DASH_LENGTH} ${DASH_GAP}` },
    hovered: {
        strokeDasharray: `0 ${DASH_TOTAL}`,
        strokeWidth: 2,
        transition: { duration: 0.5, ease: expoOut },
    },
}

const backgroundVariants: Variants = {
    hovered: (x: number) => {
        return {
            x,
            transition: {
                duration: 0.5,
                ease: expoOut,
                delay: 0.1,
            },
        }
    },
}

const containerVariants: Variants = {
    rest: { filter: "blur(0px)" },
    hovered: {
        filter: ["blur(2px)", "blur(0px)"],
        transition: {
            duration: 0.5,
            ease: expoOut,
            delay: 0.1,
        },
    },
}

function BorderedSpan({ children, offsetX }: { children: React.ReactNode; offsetX: number }) {
    return (
        <motion.span
            custom={offsetX}
            variants={backgroundVariants}
            transition={{ duration: 0.3, ease: expoOut }}
            className="relative h-full px-5 flex items-center"
        >
            {children}
            <svg
                aria-label="Bordered span"
                className="absolute text-mat-2/30 inset-0 w-full h-full pointer-events-none"
                fill="none"
            >
                <motion.rect
                    x={BORDER_WIDTH / 2}
                    y={BORDER_WIDTH / 2}
                    width={`calc(100% - ${BORDER_WIDTH}px)`}
                    height={`calc(100% - ${BORDER_WIDTH}px)`}
                    rx="6"
                    ry="6"
                    stroke="currentColor"
                    strokeWidth={BORDER_WIDTH}
                    variants={rectVariants}
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values={`0;-${DASH_TOTAL}`}
                        dur={`${DURATION}s`}
                        repeatCount="indefinite"
                    />
                </motion.rect>
            </svg>
        </motion.span>
    )
}

type LandingActionButtonProps = {
    activeComponentsCount: number
}

export default function LandingActionButton({ activeComponentsCount }: LandingActionButtonProps) {
    const t = useTranslations("common")
    return (
        <motion.div
            variants={containerVariants}
            initial="rest"
            whileHover="hovered"
            className="inline-flex group"
        >
            <Link
                href="/docs/components"
                className="flex items-center gap-x-1 h-14 text-sm font-medium"
            >
                <BorderedSpan offsetX={22}>
                    {t("explore-components")}
                    <sup className="ml-1 font-mono group-hover:opacity-0 transition-opacity duration-300">
                        {formatComponentNumber(activeComponentsCount)}
                    </sup>
                </BorderedSpan>

                <BorderedSpan offsetX={-24}>
                    <ArrowRight className="size-4" />
                </BorderedSpan>
            </Link>
        </motion.div>
    )
}
