"use client"

import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react"
import { useState } from "react"
import Button from "@/components/ui/Button"
import CardPixelBlur from "@/components/ui/CardPixelBlur"
import { useCopy } from "@/hooks/use-copy"

type ProLicenseHelperProps = {
    licenseKey: string
}

function blurLicenseKey(licenseKey?: string) {
    if (!licenseKey) return ""
    return "•".repeat(Math.min(licenseKey.length ?? 0, 32))
}

export default function ProLicenseHelper({ licenseKey }: ProLicenseHelperProps) {
    const { copied, copy } = useCopy({ resetAfterMs: 2000 })
    const [revealed, setRevealed] = useState(false)

    const revealLabel = revealed ? "Hide license key" : "Reveal license key"

    return (
        <CardPixelBlur className="p-8 space-y-4" containerClassName="mb-12">
            <div className="flex flex-col">
                <p className="text-2xl font-semibold flex items-center gap-2 justify-between w-full">
                    Your license key
                    <KeyRound className="size-5" />
                </p>
                <p className="text-sm text-mat-2">
                    Needed to install pro component &mdash; see instructions below.
                </p>
            </div>

            <div className="relative">
                {licenseKey && (
                    <code className="block border bg-mat-5 px-4 py-3 pr-20 rounded-lg text-sm font-mono break-all">
                        {revealed && licenseKey}
                        {!revealed && blurLicenseKey(licenseKey)}
                    </code>
                )}

                {!licenseKey && (
                    <span className="block border bg-mat-5 px-4 py-3 pr-20 rounded-lg text-sm">
                        Sign in to view your license key.
                    </span>
                )}

                {licenseKey && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-x-1">
                        <Button
                            variant="ghost-transparent"
                            size="icon"
                            onClick={() => setRevealed((v) => !v)}
                            aria-label={revealLabel}
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
        </CardPixelBlur>
    )
}
