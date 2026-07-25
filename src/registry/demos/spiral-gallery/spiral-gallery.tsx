import {
    SpiralGallery,
    type SpiralGalleryProps,
} from "@/registry/base/spiral-gallery/spiral-gallery"

const ITEMS = Array.from({ length: 20 }, (_, index) => ({
    src: `/images/demo/shared/${index + 1}.webp`,
    alt: `Spiral gallery image ${index + 1}`,
}))

export default function SpiralGalleryDemo(controls: Partial<SpiralGalleryProps>) {
    return (
        <div className="h-screen">
            <SpiralGallery items={ITEMS} className="fixed inset-0 h-full w-full" {...controls} />
        </div>
    )
}
