"use client"

import { ArrowLeftIcon, LoaderIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import Brand from "@/components/common/Brand"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import { env } from "@/env"
import { useRouter } from "@/i18n/navigation"
import { signIn } from "@/lib/api"
import { DEFAULT_PIXEL_SIZE } from "@/lib/constants"
import { getErrorMessage } from "@/lib/utils"

type FormState = { status: "initial" } | { status: "sent" } | { status: "error"; message: string }

export default function AuthLoginForm() {
    const router = useRouter()
    const tAuth = useTranslations("auth.login")
    const tCommon = useTranslations("common")

    const [state, action, sending] = useActionState<FormState, FormData>(
        async (_, formData) => {
            try {
                await signIn(formData.get("email") as string)
                return { status: "sent" }
            } catch (err) {
                return {
                    status: "error",
                    message: getErrorMessage(err),
                }
            }
        },
        { status: "initial" },
    )

    useEffect(() => {
        if (state.status === "sent") {
            toast.success(tAuth("magic-link-sent"), { position: "top-center" })
        } else if (state.status === "error") {
            toast.error(state.message, {
                position: "top-center",
            })
        }
    }, [state, tAuth])

    return (
        <div className="flex flex-col min-h-screen items-center justify-start gap-y-5 relative z-2 px-4 w-full">
            <BackgroundPixelGrid
                pixelSize={DEFAULT_PIXEL_SIZE}
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 190%)` }}
            />

            <form
                action={action}
                className="z-2 relative w-full mt-[18vh] max-w-md p-10 rounded-xl bg-bg/50 space-y-3 flex flex-col items-center justify-center"
            >
                <Brand version className="pointer-events-none" />

                <p className="text-sm text-accent-2 text-center mb-7">{tAuth("intro")}</p>

                <label htmlFor="email" className="sr-only">
                    Email address
                </label>

                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="youremail@example.com"
                    className="w-full"
                    required
                />

                <Button
                    size="medium"
                    variant="secondary"
                    type="submit"
                    disabled={sending}
                    className="w-full"
                >
                    {sending && (
                        <span className="text-sm flex items-center gap-x-2 animate-pulse">
                            <LoaderIcon className="size-4 animate-spin" />
                            {tAuth("sending-link")}
                        </span>
                    )}
                    {!sending && tAuth("submit")}
                </Button>

                <p className="text-sm text-center">
                    {tAuth("need-pro")}{" "}
                    <a
                        href={env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                        className="text-theme-fg underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {tAuth("buy-license")}
                    </a>
                </p>

                <Button
                    type="button"
                    className="mt-10 gap-x-2"
                    size="big"
                    onClick={() => router.back()}
                    variant="ghost"
                >
                    <ArrowLeftIcon className="size-4" />
                    {tCommon("go-back")}
                </Button>
            </form>
        </div>
    )
}
