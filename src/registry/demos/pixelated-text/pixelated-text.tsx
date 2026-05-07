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
        <div className="flex items-center justify-center h-screen w-screen flex-col space-y-2">
            <span className="font-serif xs:text-5xl text-center text-4xl">
                Seo friendly{" "}
                <PixelatedText
                    pixelSize={2.1}
                    flicker={0.7}
                    chaos={0.2}
                    depth={0.1}
                    aberration={0}
                    colors={PALETTE}
                    fps={200}
                    {...controls}
                >
                    pixelated
                </PixelatedText>{" "}
                text.
            </span>

            <span className="text-sm text-accent-1 italic">
                Responsive and scales with your current font size.
            </span>
        </div>
    )
}
