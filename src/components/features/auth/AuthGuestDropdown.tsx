"use client"

import { KeyRound, User } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu } from "radix-ui"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import DropdownButton from "@/components/ui/DropdownButton"
import { env } from "@/env"
import { useDropdownFocus } from "@/hooks/use-dropdown-focus"
import { Link } from "@/i18n/navigation"

export default function AuthGuestDropdown() {
    const focus = useDropdownFocus()
    const tAuth = useTranslations("auth.guest-dropdown")
    const tCommon = useTranslations("common")

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <DropdownButton aria-label="Guest menu" variant="secondary">
                    <User className="size-3.5" />
                </DropdownButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    {...focus}
                    align="end"
                    sideOffset={8}
                    className="data-[state=open]:a-pop-in data-[state=closed]:a-pop-out z-10"
                >
                    <Card className="z-50 w-72 p-4 space-y-3">
                        <div className="space-y-1 border-b pb-5 border-dashed">
                            <p className="text-sm font-medium">{tAuth("welcome")}</p>
                            <p className="text-xs text-accent-2">{tAuth("intro")}</p>
                        </div>

                        <DropdownMenu.Separator className="h-px bg-border" />

                        <div className="space-y-2">
                            <DropdownMenu.Item asChild>
                                <Button
                                    variant="secondary"
                                    asChild
                                    className="w-full"
                                    size="medium"
                                >
                                    <a
                                        href={env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {tCommon("go-pro")}
                                        <AnimatedArrow className="size-3.5" />
                                    </a>
                                </Button>
                            </DropdownMenu.Item>

                            <DropdownMenu.Item asChild>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">
                                        <KeyRound className="size-3.5" />
                                        {tCommon("sign-in")}
                                    </Link>
                                </Button>
                            </DropdownMenu.Item>
                        </div>
                    </Card>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
