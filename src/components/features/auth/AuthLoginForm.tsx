"use client"

import { ArrowLeftIcon, LoaderIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import BrandLink from "@/components/common/BrandLink"
import Button from "@/components/ui/Button"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import { signIn } from "@/hooks/use-polar-customer"
import { DEFAULT_PIXEL_SIZE, VERSION } from "@/lib/constants"
import { getErrorMessage } from "@/lib/utils"

type FormState = { status: "initial" } | { status: "sent" } | { status: "error"; message: string }

export default function AuthLoginForm() {
    const router = useRouter()

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
            toast.success(
                "If an account exists with that email, a login link has been sent. Check your inbox",
                {
                    position: "top-center",
                    duration: Infinity,
                },
            )
        } else if (state.status === "error") {
            toast.error(state.message, {
                position: "top-center",
                duration: Infinity,
            })
        }
    }, [state])

    return (
        <div className="flex flex-col min-h-screen items-center justify-start gap-y-5 relative z-2 px-4 w-full">
            <BackgroundPixelGrid
                pixelSize={DEFAULT_PIXEL_SIZE}
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 190%)` }}
            />

            <form
                action={action}
                className="z-2 relative w-full mt-[18vh] max-w-md p-10 rounded-xl bg-background/50 space-y-4 flex flex-col items-center justify-center"
            >
                <BrandLink
                    className="pointer-events-none"
                    slot={<span className="text-mat-2/70 font-serif text-xl">({VERSION})</span>}
                />

                <p className="text-sm text-mat-2 text-center mb-7">
                    If you already have a license, a login link will be sent to you by email to
                    safely connect to your account.
                </p>

                <label htmlFor="email" className="sr-only">
                    Email address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="youremail@example.com"
                    required
                    className="w-full px-4 py-2.5 h-12 border border-border rounded-lg text-sm bg-transparent text-mat-1 placeholder:text-mat-3 outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition-all duration-150"
                />

                <Button
                    size="big"
                    variant="secondary"
                    type="submit"
                    disabled={sending}
                    className="w-full"
                >
                    {sending && (
                        <span className="text-sm flex items-center gap-x-2 animate-pulse">
                            <LoaderIcon className="size-4 animate-spin" />
                            sending the link
                        </span>
                    )}
                    {!sending && "Login"}
                </Button>

                <p className="text-sm text-center">
                    Need pro access?{" "}
                    <a
                        href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                        className="text-highlight underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Buy a license
                    </a>
                </p>

                <Button
                    type="button"
                    className="mt-10 gap-x-2"
                    size="big"
                    onClick={() => router.back()}
                    variant="ghost-transparent"
                >
                    <ArrowLeftIcon className="size-4" />
                    Go back
                </Button>
            </form>
        </div>
    )
}
