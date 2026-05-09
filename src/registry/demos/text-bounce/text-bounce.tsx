import { TextBounce, type TextBounceProps } from "@/registry/base/text-bounce/text-bounce"

export default function TextBounceDemo(controls: Partial<TextBounceProps>) {
    return (
        <div className="flex items-center justify-center h-screen w-full text-[7vw] font-serif">
            <p className="tracking-[0.04em]">
                <TextBounce {...controls}>Hey! Stop touching me!</TextBounce>
            </p>
        </div>
    )
}
