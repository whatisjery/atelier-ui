import { type Easing, motion, type Variants } from "motion/react"

const EASE: Easing = [0.85, 0, 0.2, 1]

export interface StripeWipeProps {
    stripes?: number
    segments?: number
    reverse?: boolean
    stagger?: number
    duration?: number
    trigger?: boolean
    className?: string
}

export function StripeWipe({
    stripes = 8,
    segments = 5,
    reverse = false,
    stagger = 0.04,
    duration = 1.2,
    trigger = true,
    className,
}: StripeWipeProps) {
    const orchestrate: Variants = {
        initial: {},
        animate: {
            transition: {
                staggerChildren: stagger,
                staggerDirection: reverse ? -1 : 1,
            },
        },
    }

    const segment: Variants = {
        initial: { x: 0 },
        animate: {
            x: "-101%",
            transition: { duration, ease: EASE },
        },
    }

    return (
        <motion.div
            className={`flex overflow-hidden ${className ?? ""}`}
            initial="initial"
            animate={trigger ? "animate" : "initial"}
            variants={orchestrate}
        >
            {Array.from({ length: stripes }, (_, stripeIndex) => (
                <motion.div
                    key={stripeIndex}
                    className="flex flex-1 flex-col overflow-hidden"
                    variants={orchestrate}
                >
                    {Array.from({ length: segments }, (_, segmentIndex) => (
                        <motion.div
                            key={segmentIndex}
                            className="flex-1 bg-[black]"
                            variants={segment}
                        />
                    ))}
                </motion.div>
            ))}
        </motion.div>
    )
}
