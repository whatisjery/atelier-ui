"use client"

import { AlertCircle, Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import Alert from "@/components/ui/Alert"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import { Link } from "@/i18n/navigation"
import { DEFAULT_PIXEL_SIZE, SUPPORT_EMAIL } from "@/lib/constants"
import type { PolarAuthError } from "@/types/polar"

type AuthErrorProps = {
    error: PolarAuthError
}

export default function AuthError({ error }: AuthErrorProps) {
    const tAuth = useTranslations("auth.error")
    const tCommon = useTranslations("common")

    const supportLink = (chunks: React.ReactNode) => (
        <Link className="underline hover:no-underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {chunks}
        </Link>
    )

    return (
        <div className="flex flex-col min-h-screen items-center justify-start gap-y-5 relative z-2 px-4 w-full">
            <BackgroundPixelGrid
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 220%)` }}
                pixelSize={DEFAULT_PIXEL_SIZE}
            />

            <div className="z-2 w-full mt-[18vh] max-w-md p-10 rounded-xl bg-bg/50 flex flex-col items-center justify-center">
                {error === "email_failed" && (
                    <Alert
                        icon={<AlertCircle strokeWidth={1.5} className="size-6" />}
                        className="mb-10 text-xs"
                        variant="error"
                        title={tAuth("title")}
                    >
                        <p className="mb-2">{tAuth("email-failed")}</p>
                        <p>{tAuth.rich("help", { link: supportLink })}</p>
                    </Alert>
                )}

                {error === "payment_failed" && (
                    <Alert className="mb-10 text-xs" variant="error" title={tAuth("title")}>
                        <p className="mb-2">{tAuth("payment-failed")}</p>
                        <p>{tAuth.rich("help", { link: supportLink })}</p>
                    </Alert>
                )}

                <Button asChild variant="secondary" className="mb-2 w-full gap-x-2">
                    <Link href="/">
                        <AnimatedArrow direction="left" className="size-4" />
                        {tCommon("go-back")}
                    </Link>
                </Button>

                <Button asChild variant="ghost" className="gap-x-2 w-full">
                    <Link href={`mailto:${SUPPORT_EMAIL}`}>
                        <Mail className="size-4" />
                        {tCommon("support")}
                    </Link>
                </Button>
            </div>
        </div>
    )
}
