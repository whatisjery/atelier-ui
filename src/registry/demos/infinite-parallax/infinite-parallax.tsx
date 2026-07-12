import {
    InfiniteParallax,
    type InfiniteParallaxProps,
} from "@/registry/base/infinite-parallax/infinite-parallax"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]
const IMAGE_URLS_2 = [
    "/images/demo/shared/12.webp",
    "/images/demo/shared/19.webp",
    "/images/demo/shared/18.webp",
    "/images/demo/shared/6.webp",
]
const IMAGE_URLS_3 = [
    "/images/demo/shared/11.webp",
    "/images/demo/shared/15.webp",
    "/images/demo/shared/20.webp",
    "/images/demo/shared/19.webp",
]

export default function InfiniteParallaxDemo(controls: Partial<InfiniteParallaxProps>) {
    return (
        <>
            <div className="h-screen font-serif text-5xl flex items-center justify-center">
                Scroll down
            </div>

            <div className="h-screen bg-bg flex overflow-hidden gap-2">
                <InfiniteParallax {...controls}>
                    {IMAGE_URLS.map((url) => (
                        <img
                            width={100}
                            height={100}
                            key={url}
                            src={url}
                            alt={url}
                            className="aspect-5/7 w-full mb-2 object-cover"
                        />
                    ))}
                </InfiniteParallax>

                <InfiniteParallax {...controls} reversed>
                    {IMAGE_URLS_2.map((url) => (
                        <img
                            width={100}
                            height={100}
                            key={url}
                            src={url}
                            alt={url}
                            className="aspect-5/7 w-full mb-2 object-cover"
                        />
                    ))}
                </InfiniteParallax>

                <InfiniteParallax {...controls}>
                    {IMAGE_URLS_3.map((url) => (
                        <img
                            width={100}
                            height={100}
                            key={url}
                            src={url}
                            alt={url}
                            className="aspect-5/7 w-full mb-2 object-cover"
                        />
                    ))}
                </InfiniteParallax>
            </div>

            <div className="h-screen font-serif text-5xl flex items-center justify-center">
                Scroll up
            </div>
        </>
    )
}
