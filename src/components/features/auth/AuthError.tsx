"use client"

import { ArrowRight, Mail } from "lucide-react"
import Alert from "@/components/ui/Alert"
import Button from "@/components/ui/Button"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import { Link } from "@/i18n/navigation"
import { DEFAULT_PIXEL_SIZE, SUPPORT_EMAIL } from "@/lib/constants"
import type { PolarAuthError } from "@/types/polar"

type AuthErrorProps = {
    error: PolarAuthError
}

export default function AuthError({ error }: AuthErrorProps) {
    return (
        <div className="flex flex-col min-h-screen items-center justify-start gap-y-5 relative z-2 px-4 w-full">
            <BackgroundPixelGrid
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 220%)` }}
                pixelSize={DEFAULT_PIXEL_SIZE}
            />

            <div className="z-2 w-full mt-[18vh] max-w-md p-10 rounded-xl bg-background/50 flex flex-col items-center justify-center">
                {error === "email_failed" && (
                    <Alert className="mb-10 text-xs" variant="error" title="No panic!">
                        <p className="mb-2">
                            The link you used to access the page is invalid or expired, try again.
                        </p>

                        <p>
                            if you keep getting this error, please{" "}
                            <Link
                                className="underline hover:no-underline"
                                href={`mailto:${SUPPORT_EMAIL}`}
                            >
                                send us an email
                            </Link>{" "}
                            with the email used during the purchase. We'll get back to you quickly.
                        </p>
                    </Alert>
                )}

                {error === "payment_failed" && (
                    <Alert className="mb-10 text-xs" variant="error" title="No panic!">
                        <p className="mb-2">Try logging in from your account.</p>
                        <p>
                            If that didn't work,{" "}
                            <Link
                                className="underline hover:no-underline"
                                href={`mailto:${SUPPORT_EMAIL}`}
                            >
                                send us an email
                            </Link>{" "}
                            with the email used during the purchase. We'll get back to you quickly.
                        </p>
                    </Alert>
                )}

                <Button asChild size="big" variant="secondary" className="mb-2 w-full gap-x-2">
                    <Link href="/">
                        Return home
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>

                <Button asChild size="big" variant="ghost-transparent" className="gap-x-2 w-full">
                    <Link href={`mailto:${SUPPORT_EMAIL}`}>
                        <Mail className="size-4" />
                        Contact support
                    </Link>
                </Button>
            </div>
        </div>
    )
}
