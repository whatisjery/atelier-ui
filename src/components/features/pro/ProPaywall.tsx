"use client"

import { Lock } from "lucide-react"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import CardPixelBlur from "@/components/ui/CardPixelBlur"
import { Link } from "@/i18n/navigation"

export default function ProPaywall() {
    return (
        <CardPixelBlur className="flex flex-col w-full h-full rounded-xl items-center justify-between py-5 ">
            <div className="p-3 border rounded-full mb-3">
                <Lock className="size-6" />
            </div>

            <div className="flex flex-col items-center justify-center">
                <span className="text-xl font-medium tracking-[-0.02em] mb-2">
                    Unlock component
                </span>

                <p className="text-sm text-mat-2 max-w-sm text-center mb-5">
                    Unlock the source code and CLI install with a one-time license. Yours forever.
                </p>
            </div>

            <div className="flex items-center justify-center gap-2">
                <Button className="gap-x-2" variant="secondary">
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL as string}
                    >
                        Go pro
                        <AnimatedArrow />
                    </a>
                </Button>

                <Button asChild className="gap-x-2" variant="primary">
                    <Link href="/login">
                        Sign in
                        <AnimatedArrow />
                    </Link>
                </Button>
            </div>

            <small className="text-xs text-mat-2/80 pt-20 pb-5 italic max-w-sm text-center mt-auto">
                One-time payment. Lifetime access to all current and future pro components.
            </small>
        </CardPixelBlur>
    )
}
