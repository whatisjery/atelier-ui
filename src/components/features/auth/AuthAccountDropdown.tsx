"use client"

import { ArrowRight, Check, Copy, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropdownMenu } from "radix-ui"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import DropdownButton from "@/components/ui/DropdownButton"
import Tooltip from "@/components/ui/Tooltip"
import { env } from "@/env"
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
    const tAuth = useTranslations("auth.account-dropdown")

    const handleSignOut = async () => {
        setCustomer(null)
        router.push("/")

        try {
            await signOut()
        } catch (error) {
            console.error("Background(silent) sign-out failed:", error)
        }
    }

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <DropdownButton aria-label="Account menu" variant="secondary">
                    {customer?.email.charAt(0).toUpperCase()}
                </DropdownButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    {...focus}
                    align="end"
                    sideOffset={8}
                    className="data-[state=open]:a-pop-in data-[state=closed]:a-pop-out z-10"
                >
                    <Card className="z-50 w-80 p-4 space-y-3 ">
                        <DropdownMenu.Label className="px-2 border-b pb-5 border-dashed">
                            <p className="text-xs text-accent-2">{tAuth("signed-in-as")}</p>
                            <p className="text-sm font-medium">{customer?.email}</p>
                        </DropdownMenu.Label>

                        <DropdownMenu.Separator className="h-px bg-border" />

                        {customer?.licenseKey && (
                            <div className="space-y-2.5">
                                <Badge
                                    className="w-fit"
                                    title={tAuth("license-active")}
                                    variant="neutral"
                                />

                                <code className="relative block bg-accent-5 p-4 pr-9 rounded-lg text-xs font-mono break-all">
                                    ATELIER_PRO_KEY={customer.licenseKey}
                                    <Tooltip title="Copy">
                                        <Button
                                            variant="tertiary"
                                            size="icon"
                                            onClick={() =>
                                                copy(`ATELIER_PRO_KEY=${customer.licenseKey}`)
                                            }
                                            className="absolute top-1 right-1 size-6 hover:bg-accent-4"
                                            aria-label="Copy license key"
                                        >
                                            {copied && <Check className="size-3" />}

                                            {!copied && <Copy className="size-3" />}
                                        </Button>
                                    </Tooltip>
                                </code>

                                <p className="text-xs text-accent-2">{tAuth("license-help")}</p>
                            </div>
                        )}

                        {!customer?.licenseKey && (
                            <DropdownMenu.Item asChild>
                                <a
                                    href={env.NEXT_PUBLIC_POLAR_CHECKOUT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-2 py-2 rounded-md text-sm hover:bg-accent-5 cursor-pointer"
                                >
                                    {tAuth("get-license")}
                                    <ArrowRight className="size-3.5" />
                                </a>
                            </DropdownMenu.Item>
                        )}

                        <DropdownMenu.Separator className="h-px bg-border" />

                        <DropdownMenu.Item asChild>
                            <Button variant="ghost" onClick={handleSignOut} className="w-full">
                                <LogOut className="size-3.5" />
                                {tAuth("sign-out")}
                            </Button>
                        </DropdownMenu.Item>
                    </Card>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
