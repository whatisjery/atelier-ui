import Image from "next/image"
import { ImageTrail, type ImageTrailProps } from "@/registry/base/image-trail/image-trail"

const ITEMS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/4.webp",
    "/images/demo/shared/5.webp",
    "/images/demo/shared/6.webp",
    "/images/demo/shared/7.webp",
    "/images/demo/shared/8.webp",
    "/images/demo/shared/9.webp",
    "/images/demo/shared/10.webp",
    "/images/demo/shared/11.webp",
    "/images/demo/shared/12.webp",
    "/images/demo/shared/13.webp",
    "/images/demo/shared/14.webp",
    "/images/demo/shared/15.webp",
    "/images/demo/shared/16.webp",
    "/images/demo/shared/17.webp",
    "/images/demo/shared/18.webp",
    "/images/demo/shared/19.webp",
    "/images/demo/shared/20.webp",
]

export default function ImageTrailDemo(controls: Partial<ImageTrailProps>) {
    return (
        <>
            <div className="demo-text absolute inset-0 z-10 flex items-center justify-center">
                Hover anywhere!
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
