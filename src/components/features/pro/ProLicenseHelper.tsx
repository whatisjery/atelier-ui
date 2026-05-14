"use client"

import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import Button from "@/components/ui/Button"
import CardPixelHover from "@/components/ui/CardPixelHover"
import { useCopy } from "@/hooks/use-copy"
import { useGlobalStore } from "@/lib/store"

function blurLicenseKey(licenseKey?: string) {
    if (!licenseKey) return ""
    return "•".repeat(Math.min(licenseKey.length ?? 0, 32))
}

export default function ProLicenseHelper() {
    const customer = useGlobalStore((s) => s.customer)
    const { copied, copy } = useCopy({ resetAfterMs: 2000 })
    const [revealed, setRevealed] = useState(false)
    const tPro = useTranslations("pro.license-helper")

    const licenseKey = customer?.licenseKey

    return (
        <CardPixelHover className="p-6 space-y-4" containerClassName="mb-12">
            <div className="flex flex-col">
                <p className="text-2xl font-semibold flex items-center gap-2 justify-between w-full">
                    {tPro("title")}
                </p>

                <p className="text-sm">
                    {tPro.rich("description", {
                        link: (chunks) => (
                            <a href="#set-up-pro-license" className="underline hover:no-underline">
                                {chunks}
                            </a>
                        ),
                    })}
                </p>
            </div>

            <div className="relative">
                {licenseKey && (
                    <code className="block border bg-accent-5 px-4 py-3 pr-20 rounded-lg text-sm font-mono break-all">
                        {revealed && licenseKey}
                        {!revealed && blurLicenseKey(licenseKey)}
                    </code>
                )}

                {!licenseKey && (
                    <span className="block border bg-accent-5 px-4 py-3 pr-20 rounded-lg text-sm">
                        {tPro("sign-in-prompt")}
                    </span>
                )}

                {licenseKey && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRevealed((v) => !v)}
                            aria-label={revealed ? "Hide license key" : "Reveal license key"}
                            className="size-7"
                        >
                            {revealed && <EyeOff className="size-3.5" />}
                            {!revealed && <Eye className="size-3.5" />}
                        </Button>

                        <Button
                            variant="primary"
                            size="icon"
                            onClick={() => copy(licenseKey)}
                            aria-label="Copy license key"
                            className="size-7"
                        >
                            {copied && <Check className="size-3.5" />}
                            {!copied && <Copy className="size-3.5" />}
                        </Button>
                    </div>
                )}
            </div>
        </CardPixelHover>
    )
}
