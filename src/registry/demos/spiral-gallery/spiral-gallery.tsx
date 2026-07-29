import { motion } from "motion/react"
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
            <motion.span
                initial={{ opacity: 0, filter: "blur(3px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(3px)" }}
                transition={{ duration: 1.2, ease: [0.2, 0.03, 0.26, 0.99], delay: 0.5 }}
                className="fixed bottom-12 left-1/2 -translate-x-1/2 font-serif text-4xl"
            >
                Spiral gallery
            </motion.span>

            <SpiralGallery items={ITEMS} className="fixed inset-0 mb-10" {...controls} />
        </div>
    )
}
