"use client"

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
        <div className="flex items-center justify-center absolute w-full h-full flex-col">
            <span className="font-serif xs:text-5xl relative z-1 text-center text-4xl">
                Seo friendly{" "}
                <PixelatedText
                    pixelSize={2.1}
                    flicker={0.7}
                    chaos={0.2}
                    depth={0.1}
                    aberration={0}
                    colors={PALETTE}
                    speed={200}
                    {...controls}
                >
                    pixelated
                </PixelatedText>{" "}
                text.
            </span>

            <span className="mt-5 text-sm text-mat-1 italic">
                Responsive and scales with your current font size.
            </span>
        </div>
    )
}
