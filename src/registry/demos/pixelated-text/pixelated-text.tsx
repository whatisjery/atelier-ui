import {
    PixelatedText,
    type PixelatedTextProps,
} from "@/registry/base/pixelated-text/pixelated-text"

const PALETTE = ["#ff3e3e", "#3e8cff", "#606060", "#ffdc3e", "#3effe0", "#ff8c3e"]

export default function PixelatedTextDemo(controls: Partial<PixelatedTextProps>) {
    return (
        <div className="text-center flex items-center justify-center h-screen w-screen">
            <div className="font-medium text-6xl tracking-tight">
                <span>Accessible&nbsp;</span>
                <PixelatedText render={<p />} colors={PALETTE} {...controls}>
                    Pixelated
                </PixelatedText>
                &nbsp;text.
            </div>
        </div>
    )
}
