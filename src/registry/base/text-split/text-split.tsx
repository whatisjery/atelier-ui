import { Fragment, type ReactNode } from "react"
import { type RenderProp, useRender } from "../../hooks/use-render"

type SplitBy = "letters" | "words"

export type TextSplitProps = {
    children: string
    splitBy?: SplitBy
    showMask?: boolean
    renderItems?: (char: string, index: number) => ReactNode
    render?: RenderProp
}

function splitText(text: string, splitBy: SplitBy) {
    if (splitBy === "letters") return text.split("")
    if (splitBy === "words") return text.split(" ")
    return []
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
    const parts = splitText(children, splitBy)

    const content = parts.map((part, index) => {
        const spacer = index < parts.length - 1 && " "
        const elements = splitText(part, splitBy)
        return (
            <Mask showMask={showMask} key={index}>
                {elements.map((char, i) => (
                    <Fragment key={i}>{renderItems ? renderItems(char, index) : char}</Fragment>
                ))}

                {splitBy !== "letters" && spacer}
            </Mask>
        )
    })

    return useRender({
        render,
        defaultElement: <span />,
        props: { children: content },
    })
}
