import { TextBounce, type TextBounceProps } from "@/registry/base/text-bounce/text-bounce"

export default function TextBounceDemo(controls: Partial<TextBounceProps>) {
    return (
        <div className="flex items-center justify-center h-screen w-full flex-col text-[8vw] font-serif">
            <TextBounce render={<span className="text-[8vw] -mb-[3vw]" />} {...controls}>
                Hover the letters
            </TextBounce>
            <TextBounce render={<span className="text-[8vw]" />} {...controls}>
                to make them bounce.
            </TextBounce>

            <TextBounce render={<span className="text-[8vw] -mb-[3vw]" />} {...controls}>
                You can render
            </TextBounce>
            <TextBounce render={<span className="text-[8vw] -mb-[3vw]" />} {...controls}>
                any element you want
            </TextBounce>
            <TextBounce render={<span className="text-[8vw]" />} {...controls}>
                !
            </TextBounce>
        </div>
    )
}
