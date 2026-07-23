import { Check } from "lucide-react"
import Button from "@/components/ui/Button"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

const DEFAULT_DASH = 4
const DEFAULT_GAP = 4

const FRAME_HANDLES = [
    "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const

const PLANS = [
    {
        label: "plan / 01",
        title: "Free catalog.",
        price: "$0",
        highlighted: false,
        button: "Browse the catalog",
        features: [
            "25+ open-source components",
            "Production-ready, typed React code",
            "Shared WebGL canvas system",
            "CLI install, code you own",
            "MIT licensed, yours forever",
            "Community support",
        ],
    },
    {
        label: "plan / 02",
        title: "Get everything, forever.",
        price: "$79.99",
        highlighted: true,
        button: "Get pro access",
        features: [
            "Shader Studio, live editing and export",
            "Every future pro release included",
            "Everything in the free catalog",
            "20 pro-only components, and counting",
            "One payment, no subscription",
            "Page transitions",
        ],
    },
] as const

type LandingPaymentCardsProps = {
    checkoutHref?: string
    proCtaSlot?: React.ReactNode
}

type PlanCardProps = {
    plan: (typeof PLANS)[number]
    checkoutHref?: string
    proCtaSlot?: React.ReactNode
}

function PlanCard({ plan, checkoutHref, proCtaSlot }: PlanCardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border w-full flex flex-col justify-between p-5 sm:p-10 relative",
                {
                    "border-accent-2/50": plan.highlighted,
                },
            )}
        >
            {plan.highlighted && (
                <div
                    aria-hidden="true"
                    className="absolute lg:-inset-6 -inset-5 pointer-events-none"
                >
                    <svg
                        aria-hidden="true"
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <rect
                            width="100"
                            height="100"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${DEFAULT_DASH} ${DEFAULT_GAP}`}
                            className="text-accent-3"
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                values="0;-24"
                                dur="1s"
                                repeatCount="indefinite"
                            />
                        </rect>
                    </svg>
                    {FRAME_HANDLES.map((corner) => (
                        <span
                            key={corner}
                            className={`handle absolute w-2.5 h-2.5 bg-theme-bg ${corner}`}
                        />
                    ))}
                </div>
            )}

            <div className="relative z-2">
                <div className="flex flex-col">
                    <p className="text-xs uppercase font-medium font-mono mb-2">{plan.label}</p>
                    <h3 className="text-3xl font-medium mb-4">{plan.title}</h3>
                </div>

                <div className="mt-5 mb-20">
                    <p className="font-medium text-5xl mb-5">{plan.price}</p>
                    <ul className="space-y-2 font-medium">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-1">
                                <Check strokeWidth={1.5} className="size-4.5" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {plan.highlighted && proCtaSlot ? (
                    proCtaSlot
                ) : (
                    <Button variant={plan.highlighted ? "secondary" : "dashed"} asChild>
                        {plan.highlighted ? (
                            <a href={checkoutHref} target="_blank" rel="noopener noreferrer">
                                {plan.button}
                            </a>
                        ) : (
                            <Link href="/catalog">{plan.button}</Link>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function LandingPaymentCards({
    checkoutHref,
    proCtaSlot,
}: LandingPaymentCardsProps) {
    return (
        <div className="flex max-lg:flex-col max-lg:gap-8 gap-15 max-lg:p-5 w-full mb-20">
            {PLANS.map((plan) => (
                <PlanCard
                    key={plan.label}
                    plan={plan}
                    checkoutHref={checkoutHref}
                    proCtaSlot={proCtaSlot}
                />
            ))}
        </div>
    )
}
