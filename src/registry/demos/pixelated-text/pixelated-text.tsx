import {
    PixelatedText,
    type PixelatedTextProps,
} from "@/registry/base/pixelated-text/pixelated-text"

const PALETTE = ["#ff3e3e", "#3e8cff", "#606060", "#ffdc3e", "#3effe0", "#ff8c3e"]

export default function PixelatedTextDemo(controls: Partial<PixelatedTextProps>) {
    return (
        <div className="text-center demo-text flex items-center justify-center h-screen w-screen flex-col space-y-2">
            <span>
                <PixelatedText render={<p />} colors={PALETTE} {...controls}>
                    Pixelated
                </PixelatedText>{" "}
                text effect!
            </span>
        </div>
    )
}
