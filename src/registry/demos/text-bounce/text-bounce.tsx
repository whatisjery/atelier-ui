import { TextBounce, type TextBounceProps } from "@/registry/base/text-bounce/text-bounce"

export default function TextBounceDemo(controls: Partial<TextBounceProps>) {
    return (
        <div className="w-screen h-screen gap-y-2 flex flex-col items-center justify-center demo-text cursor-default">
            <TextBounce render={<p />} {...controls}>
                Hover the text!
            </TextBounce>
        </div>
    )
}
