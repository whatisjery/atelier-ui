import { ArrowRight } from "lucide-react"
import PixelRevealVideo from "@/components/features/landing/PixelRevealVideo"
import Border from "@/components/ui/Border"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import videoManifest from "@/lib/video-manifest.json"

const FEATURES = [
    {
        label: "01 / Scalability",
        title: "A real WebGL system.",
        text: "Most UI libraries give you isolated components dropped here and there. Atelier components share a single canvas and stay aligned to the DOM, so everything scales as one system.",
        linkLabel: "See the component",
        href: "/docs/components/cursor/lens-media",
        video: videoManifest["lens-media"],
        name: "Lens Media",
    },
    {
        label: "02 / Performance",
        title: "Fast and well tested.",
        text: "Built on Motion and React Three Fiber, in strict TypeScript. Nothing ships until it's thoroughly tested in a real build.",
        linkLabel: "See the component",
        href: "/docs/components/cursor/hover-burst",
        video: videoManifest["hover-burst"],
        name: "Hover Burst",
    },
    {
        label: "03 / AI integration",
        title: "Made for agents (too).",
        text: "Copy a ready-made prompt and your agent integrates the component for you. The source still lands in your codebase, yours to edit. Our AI integration will grow over time.",
        linkLabel: "See the component",
        href: "/docs/components/background/orbit-gallery",
        video: videoManifest["orbit-gallery"],
        name: "Orbit Gallery",
    },
] as const

export default function LandingFeatureCards() {
    return (
        <>
            {FEATURES.map((feature, index) => (
                <article
                    key={feature.label}
                    className="group relative lg:sticky top-sticky flex max-lg:flex-col h-120 max-lg:h-auto bg-bg"
                >
                    <div className="flex-1 max-lg:flex-none flex justify-start items-center pattern-line relative">
                        <div className="flex flex-col sm:p-10 p-6 relative z-2">
                            <span className="text-xs uppercase mb-2 ml-1 text-accent-2">
                                {feature.label}
                            </span>
                            <h3 className="text-5xl mb-10 font-serif font-normal">
                                {feature.title}
                            </h3>
                            <p className="text-lg mb-5 max-w-lg">{feature.text}</p>

                            <Link
                                className="underline group-hover:no-underline"
                                href={feature.href}
                                aria-label={`See the ${feature.name} component`}
                            >
                                {feature.linkLabel}
                                <ArrowRight strokeWidth={1.5} className="inline size-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div
                        className={cn(
                            "min-w-0 flex-1 -mr-px border-l border-r overflow-hidden border-t dark:border-transparent border-accent-1 relative z-20",
                            "max-lg:flex-none max-lg:aspect-video max-lg:-ml-px",
                            FEATURES.length - 1 === index && "border-b",
                        )}
                    >
                        <figure className="w-full h-full p-5 bg-theme-bg">
                            <figcaption className="sr-only">
                                {`Video preview of the ${feature.name} component`}
                            </figcaption>
                            <PixelRevealVideo
                                src={feature.video}
                                className="w-full h-full relative left-0"
                            />
                        </figure>
                    </div>
                    <Link
                        href={feature.href}
                        aria-hidden
                        tabIndex={-1}
                        className="absolute inset-0 z-30"
                    />
                    <Border direction="horizontal" className="top-0" />
                    {FEATURES.length - 1 === index && (
                        <Border direction="horizontal" className="bottom-0" />
                    )}
                </article>
            ))}
        </>
    )
}
