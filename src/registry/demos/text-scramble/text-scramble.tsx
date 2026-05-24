import { cn } from "@/lib/utils"
import { TextScramble, type TextScrambleProps } from "@/registry/base/text-scramble/text-scramble"

const Text = ({
    children,
    className,
    controls,
}: {
    children: string
    className?: string
    controls: Partial<TextScrambleProps>
}) => {
    return (
        <TextScramble
            render={
                <span
                    className={cn(
                        "z-20 relative hover:opacity-100 opacity-40 cursor-default duration-200",
                        className,
                    )}
                />
            }
            {...controls}
        >
            {children}
        </TextScramble>
    )
}

export default function TextScrambleDemo(controls: Partial<TextScrambleProps>) {
    return (
        <div className="w-screen h-screen flex items-start text-lg sm:text-2xl flex-col justify-start p-3">
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
    )
}
