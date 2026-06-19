import Image from "next/image"
import { ImageTrail, type ImageTrailProps } from "@/registry/base/image-trail/image-trail"

const ITEMS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
]

export default function ImageTrailDemo(controls: Partial<ImageTrailProps>) {
    return (
        <>
            <div className="flex items-center justify-center absolute w-full h-full inset-0">
                <span className="font-serif xs:text-5xl relative z-1 text-center text-4xl">
                    Drag your mouse around.
                </span>
            </div>

            <ImageTrail {...controls}>
                {ITEMS.map((src) => (
                    <div
                        key={src}
                        className="w-28 h-28 flex items-center justify-center relative rounded-lg overflow-hidden"
                    >
                        <Image src={src} alt="Image" fill sizes="10vw" className="object-cover" />
                    </div>
                ))}
            </ImageTrail>
        </>
    )
}
