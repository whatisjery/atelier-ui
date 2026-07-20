import { type CurveEffectProps, CurveMedia } from "@/registry/base/curve-media/curve-media"

const IMAGE_URLS = [
    "/images/demo/shared/14.webp",
    "/images/demo/shared/5.webp",
    "/images/demo/shared/18.webp",
    "/images/demo/shared/2.webp",
    "/images/demo/shared/9.webp",
    "/images/demo/shared/11.webp",
    "/images/demo/shared/3.webp",
    "/images/demo/shared/7.webp",
]

// The controls only tweak the shared curve knobs; `type` picks the media.
type CurveMediaControls = Partial<CurveEffectProps> & { type?: "image" | "video" }

export default function CurveMediaDemo({ type = "image", ...controls }: CurveMediaControls) {
    const image = (url: string) => (
        <CurveMedia
            key={url}
            type="image"
            alt="my image"
            src={url}
            className="w-full h-auto object-cover rounded-md"
            {...controls}
        />
    )

    return (
        <>
            <div className="h-[30vh] text-3xl tracking-tight font-medium inset-0 z-10 flex items-end justify-center pointer-events-none mb-10">
                Scroll to
                <span className="text-accent-2">&nbsp;curve the images.</span>
            </div>

            {type === "video" ? (
                <div className="flex items-center justify-center p-5">
                    <CurveMedia
                        type="video"
                        src="/video/demo/shared/1.mp4"
                        className="w-full h-auto object-cover rounded-md"
                        {...controls}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 items-start gap-6 px-8 py-24">
                    <div className="flex flex-col gap-6">{IMAGE_URLS.slice(0, 4).map(image)}</div>
                    <div className="flex flex-col gap-6 -mt-16">
                        {IMAGE_URLS.slice(4, 8).map(image)}
                    </div>
                </div>
            )}
        </>
    )
}
