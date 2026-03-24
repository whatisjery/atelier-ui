"use client"

import { motion } from "motion/react"
import { expoInOut } from "@/lib/easing"

const solidShapeAnimation = {
    initial: { fill: "var(--color-mat-4)" },
    animate: { fill: "var(--color-background)" },
    transition: { duration: 1.8, ease: expoInOut },
}

const pathAnimation = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.2, ease: expoInOut, delay: 0.4 },
}

const opacityAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1, ease: expoInOut, delay: 1 },
}

const scaleAnimation = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.3, ease: expoInOut },
}

const badgeAnimation = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.3, ease: expoInOut },
}

export default function LogoOrnement() {
    const size = {
        grid: 2,
        frame: 3,
        coloredGrid: 4,
        shape: 11,
    }

    const color = {
        grid: "var(--color-mat-3)",
        shape: "var(--color-mat-1)",
        highlight: "var(--color-highlight)",
        plain: "var(--color-mat-5)",
    }

    return (
        <figure className="max-md:hidden z-5 flex flex-col items-center justify-center relative mb-6">
            <svg
                aria-label="Logo Ornement"
                width="150"
                viewBox="0 0 563 479"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g id="shape">
                    <motion.path
                        d="M227.367 352.8H151.832V270.939L265.223 106.402H340.732V206.865H416.312V352.8H303.021V229.674L227.367 352.8Z"
                        fill={color.plain}
                        {...solidShapeAnimation}
                    />

                    <motion.path
                        d="M337.499 208.748H413.052V357.418H299.802V231.984L224.175 357.418H148.668L148.668 274.023L262.018 106.402H337.499"
                        stroke={color.shape}
                        strokeWidth={size.shape}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        {...pathAnimation}
                    />
                </g>

                <motion.path
                    d="M420.508 98.9922V364.715H141.301V98.9922H420.508Z"
                    stroke={color.highlight}
                    strokeWidth={size.frame}
                    {...scaleAnimation}
                />

                <motion.g {...opacityAnimation} id="dashed-line-w-handle">
                    <line
                        x1="338.793"
                        y1="211.168"
                        x2="338.793"
                        y2="100.078"
                        stroke={color.highlight}
                        strokeWidth={size.coloredGrid}
                        strokeDasharray="9 4"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-13.5"
                            dur="0.3s"
                            repeatCount="indefinite"
                        />
                    </line>
                    <rect
                        x="323.828"
                        y="193.508"
                        width="30.0159"
                        height="30.0159"
                        rx="3"
                        fill={color.highlight}
                    />
                    <rect
                        x="323.828"
                        y="92.793"
                        width="30.0159"
                        height="30.0159"
                        rx="3"
                        fill={color.highlight}
                    />
                </motion.g>

                <motion.g {...scaleAnimation} id="handles">
                    <rect
                        x="134.848"
                        y="354.301"
                        width="14.875"
                        height="14.875"
                        fill={color.plain}
                        stroke={color.highlight}
                        strokeWidth={size.frame}
                    />
                    <rect
                        x="135.457"
                        y="94.293"
                        width="14.875"
                        height="14.875"
                        fill={color.plain}
                        stroke={color.highlight}
                        strokeWidth={size.frame}
                    />
                    <rect
                        x="410.637"
                        y="94.293"
                        width="14.875"
                        height="14.875"
                        fill={color.plain}
                        stroke={color.highlight}
                        strokeWidth={size.frame}
                    />
                    <rect
                        x="410.637"
                        y="354.301"
                        width="14.875"
                        height="14.875"
                        fill={color.plain}
                        stroke={color.highlight}
                        strokeWidth={size.frame}
                    />
                </motion.g>
            </svg>

            <motion.div
                className="bg-highlight text-background px-1 rounded-sm absolute bottom-1.5 font-medium w-fit text-sm"
                {...badgeAnimation}
            >
                Atelier
            </motion.div>
        </figure>
    )
}
