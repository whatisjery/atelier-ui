import { EdgeBounce, type EdgeBounceProps } from "@/registry/base/edge-bounce/edge-bounce"

const IMAGE_URLS = [
    "/images/demo/shared/1.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/3.webp",
]

export default function EdgeBounceDemo(controls: Partial<EdgeBounceProps>) {
    return (
        <div className="flex h-screen w-full items-center justify-center gap-5">
            {IMAGE_URLS.map((url) => (
                <EdgeBounce key={url} className="w-[25vw]" {...controls}>
                    <img
                        src={url}
                        alt="Image"
                        width={100}
                        height={100}
                        draggable={false}
                        className="aspect-[5/7] w-full rounded-md object-cover select-none pointer-events-none"
                    />
                </EdgeBounce>
            ))}
        </div>
    )
}
