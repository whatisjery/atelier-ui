import { useLenis } from "lenis/react"
import { useState } from "react"
import PixelScroll, { type PixelScrollProps } from "@/registry/base/pixel-scroll/pixel-scroll"

export default function PixelScrollDemo(controls: Partial<PixelScrollProps>) {
    const [pastMiddle, setPastMiddle] = useState(false)
    useLenis(({ progress }) => setPastMiddle(progress >= 0.5))

    return (
        <>
            {!pastMiddle && (
                <div className="fixed h-[90vh] inset-0 flex items-center justify-center demo-text">
                    Scroll down!
                </div>
            )}

            {pastMiddle && (
                <div className="fixed h-[90vh] inset-0 flex items-center justify-center demo-text">
                    Oh, hi there!
                </div>
            )}

            <PixelScroll
                colors={["#FBBE3C", "#D3D3D3"]}
                {...controls}
                overlap={30}
                direction="sweep"
                className="text-accent-1"
            />
        </>
    )
}
