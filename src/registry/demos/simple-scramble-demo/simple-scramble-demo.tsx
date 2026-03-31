"use client"

import GridPattern from "@/components/ui/GridPattern"
import { cn } from "@/lib/utils"
import { SimpleScramble } from "@/registry/base/simple-scramble/simple-scramble"

const Text = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <SimpleScramble
            className={cn(
                "z-20 relative hover:opacity-100 opacity-40 cursor-default duration-200",
                className,
            )}
        >
            {children}
        </SimpleScramble>
    )
}

export default function SimpleScrambleDemo() {
    return (
        <>
            <GridPattern hoverEffect={false} gridSize={28} />
            <div className="absolute inset-0 flex flex-col gap-y-5 p-5 items-center justify-start">
                <div className="w-full h-full flex items-start text-lg sm:text-2xl flex-col justify-start">
                    <Text>Scramble text effect</Text>
                    <Text>from left to right, with hover.</Text>

                    <div className="flex flex-col my-3">
                        <Text>Don't forget to align the</Text>
                        <Text>text on the left of the container</Text>

                        <Text>to avoid jittering.</Text>
                    </div>

                    <div className="flex flex-col mt-auto">
                        <Text>&#8627; or just use</Text>
                        <Text>a monospace font. *** have fun! ***</Text>
                    </div>
                </div>
            </div>
        </>
    )
}
