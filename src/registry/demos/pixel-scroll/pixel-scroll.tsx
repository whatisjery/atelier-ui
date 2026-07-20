import PixelScroll, { type PixelScrollProps } from "@/registry/base/pixel-scroll/pixel-scroll"

export default function PixelScrollDemo(controls: Partial<PixelScrollProps>) {
    return (
        <>
            <div className="fixed h-[90vh] text-3xl tracking-tight font-medium inset-0 flex items-center justify-center">
                Scroll to
                <span className="text-accent-2">&nbsp;move the pixels.</span>
            </div>

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
