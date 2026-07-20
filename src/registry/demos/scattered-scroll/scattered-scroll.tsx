import ScatteredScroll, {
    type ScatteredScrollProps,
} from "@/registry/base/scattered-scroll/scattered-scroll"

const IMAGE_URLS = [
    "/images/demo/shared/15.webp",
    "/images/demo/shared/20.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/1.webp",
]

export default function ScatteredScrollDemo(controls: Partial<ScatteredScrollProps>) {
    return (
        <>
            <div className="h-screen text-2xl tracking-tight font-medium flex items-center justify-center">
                Scroll to
                <span className="text-accent-2">&nbsp;to slide the images.</span>
            </div>

            <ScatteredScroll overlap={320} scrollDistance={350} {...controls}>
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

            <div className="h-screen"></div>
        </>
    )
}
