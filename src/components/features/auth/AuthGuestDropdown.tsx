"use client"

import { KeyRound, User } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import DropdownButton from "@/components/ui/DropdownButton"
import { useDropdownFocus } from "@/hooks/use-dropdown-focus"
import { Link } from "@/i18n/navigation"

export default function AuthGuestDropdown() {
    const focus = useDropdownFocus()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <DropdownButton variant="secondary">
                    <User className="size-3.5 user-select-none" />
                </DropdownButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    {...focus}
                    align="end"
                    sideOffset={8}
                    className="z-50 w-72 rounded-xl border bg-background p-4 shadow-lg/4 space-y-3 data-[state=open]:a-slide-in data-[state=closed]:a-slide-out"
                >
                    <div className="space-y-1 px-1">
                        <p className="text-sm font-medium">Welcome!</p>
                        <p className="text-xs text-mat-2">
                            Sign in to access pro components and get your license key.
                        </p>
                    </div>

                    <DropdownMenu.Separator className="h-px bg-border" />

                    <div className="space-y-2">
                        <DropdownMenu.Item asChild>
                            <Button variant="secondary" asChild className="w-full rounded-full">
                                <a
                                    href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Get pro access
                                    <AnimatedArrow className="size-3.5" />
                                </a>
                            </Button>
                        </DropdownMenu.Item>

                        <DropdownMenu.Item asChild>
                            <Button variant="ghost-transparent" asChild>
                                <Link href="/login">
                                    <KeyRound className="size-3.5" />
                                    Sign in
                                </Link>
                            </Button>
                        </DropdownMenu.Item>
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
