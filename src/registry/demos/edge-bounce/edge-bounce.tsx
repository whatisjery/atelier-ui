import { EdgeBounce, type EdgeBounceProps } from "@/registry/base/edge-bounce/edge-bounce"

const IMAGE_URLS = [
    "/images/demo/shared/12.webp",
    "/images/demo/shared/20.webp",
    "/images/demo/shared/14.webp",
]

export default function EdgeBounceDemo(controls: Partial<EdgeBounceProps>) {
    return (
        <div className="flex h-screen w-full justify-center items-center">
            <div className="absolute inset-0 flex items-center justify-center font-serif xs:text-5xl text-center text-4xl z-3 pointer-events-none text-white">
                Hover the images!
            </div>
            <div className="flex w-full flex-1 items-center justify-center gap-2">
                {IMAGE_URLS.map((url) => (
                    <EdgeBounce key={url} className="w-[30vw]" {...controls}>
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
        </div>
    )
}
