import { type LenisRef, ReactLenis } from "lenis/react"
import { cancelFrame, type FrameData, frame } from "motion"
import { useEffect, useRef } from "react"
import ScatteredScroll, {
    type ScatteredScrollProps,
} from "@/registry/base/scattered-scroll/scattered-scroll"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function ScatteredScrollDemo(controls: Partial<ScatteredScrollProps>) {
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        function update(data: FrameData) {
            const ref = lenisRef.current
            if (ref?.lenis) ref.lenis.raf(data.timestamp)
        }
        frame.update(update, true)
        return () => cancelFrame(update)
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, syncTouch: true }}>
            <div className="h-screen font-serif text-5xl flex w-full items-center justify-center">
                Scroll down
            </div>

            <ScatteredScroll {...controls}>
                {IMAGE_URLS.map((imageUrl, index) => (
                    <img
                        key={imageUrl}
                        className="w-[30vw] aspect-[5/7] object-cover rounded-md"
                        src={imageUrl}
                        alt={`Gallery item ${index + 1}`}
                        width={100}
                        height={100}
                    />
                ))}
            </ScatteredScroll>

            <div className="h-screen font-serif text-5xl flex w-full items-center justify-center">
                Scroll up
            </div>
        </ReactLenis>
    )
}
