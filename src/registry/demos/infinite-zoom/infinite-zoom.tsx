import Image from "next/image"
import InfiniteZoom, { type InfiniteZoomProps } from "@/registry/base/infinite-zoom/infinite-zoom"

const DATA = [
    "/images/demo/shared/3.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/4.webp",
    "/images/demo/shared/1.webp",
]

export default function InfiniteParallaxDemo(controls: Partial<InfiniteZoomProps>) {
    return (
        <InfiniteZoom className="absolute w-screen h-screen inset-0 overflow-hidden" {...controls}>
            {DATA.map((item) => {
                return (
                    <div className="relative w-full h-full overflow-hidden" key={item}>
                        <Image
                            src={item}
                            alt="image"
                            width={500}
                            height={500}
                            className="object-cover w-full h-full select-none pointer-events-none"
                            draggable={false}
                        />
                        <span className="absolute font-serif text-5xl text-center top-32 left-1/2 whitespace-nowrap text-[#000000] -translate-x-1/2 z-3">
                            Scroll down or up
                        </span>
                    </div>
                )
            })}
        </InfiniteZoom>
    )
}
