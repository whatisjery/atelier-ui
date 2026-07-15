import { useIsMobile } from "@/hooks/use-mobile"
import {
    InfiniteGallery,
    type InfiniteGalleryProps,
} from "@/registry/base/infinite-gallery/infinite-gallery"

const IMAGE_URLS = [
    "/images/demo/shared/20.webp",
    "/images/demo/shared/7.webp",
    "/images/demo/shared/9.webp",
    "/images/demo/shared/11.webp",
    "/images/demo/shared/15.webp",
    "/images/demo/shared/1.webp",
    "/images/demo/shared/7.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function InfiniteGalleryDemo(controls: Partial<InfiniteGalleryProps>) {
    const isMobile = useIsMobile()

    return (
        <div className="w-full h-full absolute flex justify-center">
            <InfiniteGallery
                className="w-full items-center flex"
                perView={isMobile ? 2 : 4}
                {...controls}
            >
                {IMAGE_URLS.map((url) => (
                    <img
                        key={url}
                        src={url}
                        alt="image"
                        width={600}
                        height={200}
                        className="object-cover select-none pointer-events-none"
                        draggable={false}
                    />
                ))}
            </InfiniteGallery>
        </div>
    )
}
