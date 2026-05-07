"use client"

import { Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import CardPixelHover from "@/components/ui/CardPixelHover"
import { env } from "@/env"
import { Link } from "@/i18n/navigation"
import { useGlobalStore } from "@/lib/store"

export default function ProPaywall({ children }: { children: React.ReactNode }) {
    const customer = useGlobalStore((s) => s.customer)
    const tPro = useTranslations("pro.paywall")
    const tCommon = useTranslations("common")

    if (customer?.licenseKey) return children

    return (
        <CardPixelHover className="flex flex-col w-full h-full rounded-xl items-center justify-between p-5 ">
            <div className="p-3 border rounded-full mb-3">
                <Lock className="size-6" />
            </div>

            <div className="flex flex-col items-center justify-center">
                <span className="text-xl font-medium tracking-[-0.02em] mb-2">{tPro("title")}</span>

                <p className="text-sm text-accent-2 max-w-sm text-center mb-5">
                    {tPro("description")}
                </p>
            </div>

            <div className="flex items-center justify-center gap-2">
                <Button asChild className="gap-x-2" variant="secondary">
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                    >
                        {tCommon("go-pro")}
                        <AnimatedArrow />
                    </a>
                </Button>

                <Button asChild className="gap-x-2" variant="primary">
                    <Link href="/login">
                        {tCommon("sign-in")}
                        <AnimatedArrow />
                    </Link>
                </Button>
            </div>

            <small className="text-xs text-accent-2 pt-20 pb-2 italic text-center mt-auto">
                {tPro("footer-note")}
            </small>
        </CardPixelHover>
    )
}
