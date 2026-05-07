import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    InfiniteGallery,
    type InfiniteGalleryProps,
} from "@/registry/base/infinite-gallery/infinite-gallery"

const ITEMS = [
    { src: "/images/demo/shared/1.webp", height: 200 },
    { src: "/images/demo/shared/2.webp", height: 280 },
    { src: "/images/demo/shared/3.webp", height: 200 },
    { src: "/images/demo/shared/4.webp", height: 250 },
]

export default function InfiniteGalleryDemo(controls: Partial<InfiniteGalleryProps<string>>) {
    const isMobile = useIsMobile()

    return (
        <div className="w-full h-full absolute flex justify-center">
            <InfiniteGallery
                className="w-full items-center"
                perView={isMobile ? 2 : ITEMS.length - 1}
                {...controls}
                data={ITEMS}
                renderItem={(item) => (
                    <Image
                        src={item.src}
                        alt="image"
                        width={600}
                        height={200}
                        className="object-cover select-none pointer-events-none"
                        draggable={false}
                    />
                )}
            />
        </div>
    )
}
