"use client"

import { cn } from "@/lib/utils"
import {
    SimpleScramble,
    type SimpleScrambleProps,
} from "@/registry/base/simple-scramble/simple-scramble"

const Text = ({
    children,
    className,
    controls,
}: {
    children: React.ReactNode
    className?: string
    controls: Partial<SimpleScrambleProps>
}) => {
    return (
        <SimpleScramble
            className={cn(
                "z-20 relative hover:opacity-100 opacity-40 cursor-default duration-200",
                className,
            )}
            {...controls}
        >
            {children}
        </SimpleScramble>
    )
}

export default function SimpleScrambleDemo(controls: Partial<SimpleScrambleProps>) {
    return (
        <div className="absolute inset-0 flex flex-col gap-y-5 p-5 items-center justify-start">
            <div className="w-full h-full flex items-start text-lg sm:text-2xl flex-col justify-start">
                <Text controls={controls}>Scramble text effect</Text>
                <Text controls={controls}>from left to right, with hover.</Text>

                <div className="flex flex-col my-3">
                    <Text controls={controls}>Don't forget to align the</Text>
                    <Text controls={controls}>text on the left of the container</Text>
                    <Text controls={controls}>to avoid jittering.</Text>
                </div>

                <div className="flex flex-col mt-auto">
                    <Text controls={controls}>&#8627; or just use</Text>
                    <Text controls={controls}>a monospace font. *** have fun! ***</Text>
                </div>
            </div>
        </div>
    )
}
