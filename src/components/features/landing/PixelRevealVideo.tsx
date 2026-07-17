import { cn } from "@/lib/utils"

type PixelRevealVideoProps = {
    src: string
    className?: string
}

export default function PixelRevealVideo({ src, className }: PixelRevealVideoProps) {
    return (
        <div className={cn("relative overflow-hidden", className)}>
            <video
                src={src}
                poster={src.replace(/\.mp4$/, ".webp")}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            />
        </div>
    )
}
