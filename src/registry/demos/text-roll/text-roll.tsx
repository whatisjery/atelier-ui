import { TextRoll, type TextRollProps } from "@/registry/base/text-roll/text-roll"

export default function TextRollDemo(controls: Partial<TextRollProps>) {
    return (
        <div className="flex  relative items-center mt-10 cursor-default justify-center uppercase gap-y-5 flex-col text-[7vw] font-serif">
            <div className="flex flex-col items-center">
                <TextRoll render={<p className="leading-[1.1em]" />} cycles={1} {...controls}>
                    ROLLING
                </TextRoll>

                <TextRoll
                    render={<p className="leading-[1.1em]" />}
                    cycles={1}
                    axis="y"
                    {...controls}
                >
                    while hovering,
                </TextRoll>
            </div>

            <div className="flex flex-col items-center">
                <TextRoll render={<p className="leading-[1.1em]" />} axis="y" {...controls}>
                    scrolling, mounting
                </TextRoll>

                <TextRoll render={<p className="leading-[1.1em]" />} axis="x" {...controls}>
                    (x and y axis)
                </TextRoll>
            </div>

            <div className="flex flex-col items-center">
                <TextRoll
                    render={<p className="leading-[1.1em]" />}
                    mode="group"
                    direction="forward"
                    {...controls}
                >
                    even as a group
                </TextRoll>

                <TextRoll
                    render={<p className="leading-[1.1em]" />}
                    mode="group"
                    direction="forward"
                    stagger={0.01}
                    {...controls}
                >
                    staggered!
                </TextRoll>
            </div>

            <div className="flex flex-col items-center">
                <p className="leading-[1.1em]">
                    <TextRoll direction="forward" {...controls}>
                        forward,
                    </TextRoll>{" "}
                    <TextRoll direction="backward" {...controls}>
                        backward
                    </TextRoll>
                </p>

                <TextRoll
                    render={<p className="leading-[1.1em]" />}
                    direction="random"
                    axis="y"
                    {...controls}
                >
                    (& random)
                </TextRoll>
            </div>

            <div className="flex flex-col items-center">
                <TextRoll render={<p className="leading-[1.1em]" />} cycles={3} {...controls}>
                    with many cycles
                </TextRoll>

                <TextRoll
                    render={<p className="leading-[1.1em]" />}
                    cycles={1}
                    axis="y"
                    {...controls}
                >
                    or few?
                </TextRoll>
            </div>
        </div>
    )
}
