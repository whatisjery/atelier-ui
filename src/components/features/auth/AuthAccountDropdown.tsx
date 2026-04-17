"use client"

import { ArrowRight, Check, Copy, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu } from "radix-ui"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import DropdownButton from "@/components/ui/DropdownButton"
import Tooltip from "@/components/ui/Tooltip"
import { useCopy } from "@/hooks/use-copy"
import { useDropdownFocus } from "@/hooks/use-dropdown-focus"
import { useRouter } from "@/i18n/navigation"
import { signOut } from "@/lib/api"
import { useGlobalStore } from "@/lib/store"

export default function AuthAccountDropdown() {
    const focus = useDropdownFocus()
    const customer = useGlobalStore((s) => s.customer)
    const router = useRouter()
    const setCustomer = useGlobalStore((s) => s.setCustomer)
    const { copied, copy } = useCopy({ resetAfterMs: 2000 })
    const t = useTranslations("docs.tooltips")

    const handleSignOut = async () => {
        setCustomer(null)
        router.push("/")

        try {
            await signOut()
        } catch (error) {
            console.error("Background(slient) sign-out failed:", error)
        }
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <DropdownButton variant="secondary">
                    {customer?.email.charAt(0).toUpperCase()}
                </DropdownButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    {...focus}
                    align="end"
                    sideOffset={8}
                    className="z-50 w-80 rounded-xl border bg-background p-4 shadow-lg/4 space-y-3 data-[state=open]:a-slide-in data-[state=closed]:a-slide-out"
                >
                    <DropdownMenu.Label className="px-2 py-1">
                        <p className="text-xs text-mat-3">Signed in as</p>
                        <p className="text-sm font-medium">{customer?.email}</p>
                    </DropdownMenu.Label>

                    <DropdownMenu.Separator className="h-px bg-border" />

                    {customer?.licenseKey && (
                        <div className="px-2 py-2 space-y-2.5">
                            <Badge className="w-fit" title="Pro license active" variant="calm" />

                            <div className="relative">
                                <code className="block bg-mat-5 p-4 pr-9 rounded-lg text-xs font-mono break-all">
                                    ATELIER_PRO_KEY={customer.licenseKey}
                                </code>
                                <Tooltip title={t("copy")}>
                                    <Button
                                        variant="ghost-solid"
                                        size="icon"
                                        onClick={() =>
                                            copy(`ATELIER_PRO_KEY=${customer.licenseKey}`)
                                        }
                                        className="absolute top-1 right-1 size-6 hover:bg-mat-4"
                                        aria-label="Copy license key"
                                    >
                                        {copied && <Check className="size-3" />}

                                        {!copied && <Copy className="size-3" />}
                                    </Button>
                                </Tooltip>
                            </div>
                            <p className="text-xs text-mat-2">
                                Copy and add to your .env file to install pro components.
                            </p>
                        </div>
                    )}

                    {!customer?.licenseKey && (
                        <DropdownMenu.Item asChild>
                            <a
                                href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-2 py-2 rounded-md text-sm hover:bg-mat-5 cursor-pointer"
                            >
                                Get a license
                                <ArrowRight className="size-3.5" />
                            </a>
                        </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Separator className="h-px bg-border" />

                    <DropdownMenu.Item asChild>
                        <Button variant="ghost-solid" onClick={handleSignOut} className="w-full">
                            <LogOut className="size-3.5" />
                            Sign out
                        </Button>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
