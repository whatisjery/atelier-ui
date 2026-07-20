import { useEffect, useState } from "react"
import { getBands } from "@/lib/bands"
import { TextScramble, type TextScrambleProps } from "@/registry/base/text-scramble/text-scramble"

const Row = ({
    children,
    controls,
}: {
    children: string
    controls: Partial<TextScrambleProps>
}) => {
    const text = `#${children}`

    return (
        <div className="relative font-medium tracking-tight text-lg">
            <span className="invisible">{text}</span>
            <TextScramble
                render={
                    <span className="absolute inset-0 opacity-100 hover:opacity-10 cursor-default duration-200" />
                }
                {...controls}
            >
                {text}
            </TextScramble>
        </div>
    )
}

export default function TextScrambleDemo(controls: Partial<TextScrambleProps>) {
    const [lines, setLines] = useState<string[]>([])

    // We are setting a state to avoid SSR hydration errors in next.js.
    useEffect(() => {
        setLines(getBands(40))
    }, [])

    return (
        <div className="relative w-screen h-screen px-3 flex items-center justify-center whitespace-nowrap">
            <div className="h-[80vh] flex flex-col flex-wrap content-center items-start gap-x-8">
                {lines.map((line) => (
                    <Row key={line} controls={controls}>
                        {line}
                    </Row>
                ))}
            </div>
        </div>
    )
}
