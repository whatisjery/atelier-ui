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
    return (
        <>
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
        </>
    )
}
