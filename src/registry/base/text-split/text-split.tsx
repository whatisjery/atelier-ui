import { Fragment, type ReactNode } from "react"
import { type RenderProp, useRender } from "../../hooks/use-render"

type SplitBy = "letters" | "words"

const NON_BREAKING_SPACE = " "

export type TextSplitProps = {
    children: string
    splitBy?: SplitBy
    showMask?: boolean
    renderItems?: (char: string, index: number) => ReactNode
    render?: RenderProp
}

function Mask({ children, showMask }: { children: ReactNode; showMask: boolean }) {
    if (!showMask) return children
    return <span className="overflow-clip">{children}</span>
}

export function TextSplit({
    children,
    splitBy = "letters",
    showMask = true,
    renderItems,
    render,
}: TextSplitProps) {
    const words = children.split(" ")
    let cursor = 0

    const content = words.map((word, wordIndex) => {
        const isLast = wordIndex === words.length - 1

        if (splitBy === "words") {
            return (
                <Mask showMask={showMask} key={wordIndex}>
                    {renderItems ? renderItems(word, wordIndex) : word}
                    {!isLast && " "}
                </Mask>
            )
        }

        const letters = Array.from(word).map((char) => {
            const index = cursor++
            return (
                <Mask showMask={showMask} key={index}>
                    {renderItems ? renderItems(char, index) : char}
                </Mask>
            )
        })

        let spacer: ReactNode = null
        if (!isLast) {
            const index = cursor++
            spacer = (
                <Mask showMask={showMask} key={index}>
                    {renderItems ? renderItems(" ", index) : NON_BREAKING_SPACE}
                </Mask>
            )
        }

        return (
            <Fragment key={wordIndex}>
                <span className="inline-block">
                    {letters}
                    {spacer}
                </span>
                {!isLast && <wbr />}
            </Fragment>
        )
    })

    return useRender({
        render,
        defaultElement: <span />,
        props: { children: content },
    })
}
