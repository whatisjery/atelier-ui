import { TextRoll, type TextRollProps } from "@/registry/base/text-roll/text-roll"

export default function TextRollDemo(controls: Partial<TextRollProps>) {
    return (
        <div className="flex  relative items-center mt-10 cursor-default justify-center uppercase gap-y-5 flex-col text-[7vw] font-serif">
            <div className="flex flex-col items-center">
                <p className="leading-[1.1em]">
                    <TextRoll cycles={1} {...controls}>
                        ROLLING
                    </TextRoll>
                </p>
                <p className="leading-[1.1em]">
                    <TextRoll cycles={1} axis="y" {...controls}>
                        while hovering,
                    </TextRoll>
                </p>
            </div>

            <div className="flex flex-col items-center">
                <p className="leading-[1.1em]">
                    <TextRoll axis="y" {...controls}>
                        scrolling, mounting
                    </TextRoll>
                </p>
                <p className="leading-[1.1em]">
                    <TextRoll axis="x" {...controls}>
                        (x and y axis)
                    </TextRoll>
                </p>
            </div>

            <div className="flex flex-col items-center">
                <p className="leading-[1.1em]">
                    <TextRoll mode="group" direction="forward" {...controls}>
                        even as a group
                    </TextRoll>
                </p>
                <p className="leading-[1.1em]">
                    <TextRoll mode="group" direction="forward" stagger={0.01} {...controls}>
                        staggered!
                    </TextRoll>
                </p>
            </div>

            <div className="flex flex-col items-center">
                <p className="leading-[1.1em]">
                    <TextRoll direction="forward" {...controls}>
                        forward,
                    </TextRoll>
                    <TextRoll direction="backward" {...controls}>
                        backward
                    </TextRoll>
                </p>
                <p className="leading-[1.1em]">
                    <TextRoll direction="random" axis="y" {...controls}>
                        (& random)
                    </TextRoll>
                </p>
            </div>

            <div className="flex flex-col items-center">
                <p className="leading-[1.1em]">
                    <TextRoll cycles={3} {...controls}>
                        with many cycles
                    </TextRoll>
                </p>
                <p className="leading-[1.1em]">
                    <TextRoll cycles={1} axis="y" {...controls}>
                        or few?
                    </TextRoll>
                </p>
            </div>

            <small className="mt-50 mb-5 font-sans text-xs">
                configurable rolling text animation.
            </small>
        </div>
    )
}
