import {
    PixelatedText,
    type PixelatedTextProps,
} from "@/registry/base/pixelated-text/pixelated-text"

const PALETTE = [
    "#ff3e3e",
    "#3eff8c",
    "#3e8cff",
    "#606060",
    "#ffdc3e",
    "#3effe0",
    "#ff8c3e",
    "#FF09FF",
]

export default function PixelatedTextDemo(controls: Partial<PixelatedTextProps>) {
    return (
        <div className="font-serif xs:text-7xl text-center text-4xl flex items-center justify-center h-screen w-screen flex-col space-y-2">
            <span>
                <PixelatedText colors={PALETTE} {...controls}>
                    Pixelated
                </PixelatedText>{" "}
                text
            </span>
            <span>seo friendly.</span>

            <span className="font-sans text-xs mt-5">(Responsive and match your font style)</span>
        </div>
    )
}
