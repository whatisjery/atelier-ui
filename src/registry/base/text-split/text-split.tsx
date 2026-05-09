import React from "react"

type SplitBy = "letters" | "words"

type SplitTextProps = {
    children: string
    splitBy?: SplitBy
    showMask?: boolean
    side?: "x" | "y"
    renderItems?: (char: string, index: number) => React.ReactNode
}

type MaskProps = {
    children: React.ReactNode
    showMask: boolean
} & React.HTMLAttributes<HTMLSpanElement>

function splitText(text: string, splitBy: SplitBy) {
    if (splitBy === "letters") return text.split("")
    if (splitBy === "words") return text.split(" ")
    return []
}

const Mask = ({ children, showMask, ...props }: MaskProps) => {
    if (!showMask) return children
    return (
        <span className="overflow-clip" {...props}>
            {children}
        </span>
    )
}

export function TextSplit({
    children,
    splitBy = "letters",
    showMask = true,
    renderItems,
    ...props
}: SplitTextProps & React.HTMLAttributes<HTMLSpanElement>) {
    if (typeof children !== "string") throw new Error("SplitText only accepts string children")

    const element = splitText(children, splitBy)

    return (
        <>
            {element.map((part, index) => {
                const spacer = index < element.length - 1 && " "
                const elements = splitText(part, splitBy)
                return (
                    <Mask {...props} showMask={showMask} key={index}>
                        {elements.map((char, i) => {
                            return (
                                <React.Fragment key={i}>
                                    {renderItems ? renderItems(char, index) : char}
                                </React.Fragment>
                            )
                        })}

                        {splitBy !== "letters" && spacer}
                    </Mask>
                )
            })}
        </>
    )
}
