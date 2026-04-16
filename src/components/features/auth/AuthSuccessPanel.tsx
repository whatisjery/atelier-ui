"use client"

import { ArrowRight, Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import Tooltip from "@/components/ui/Tooltip"
import { useCopy } from "@/hooks/use-copy"
import { Link } from "@/i18n/navigation"
import { DEFAULT_PIXEL_SIZE } from "@/lib/constants"

type SuccessPanelProps = {
    licenseKey: string | null
}

export default function AuthSuccessPanel({ licenseKey }: SuccessPanelProps) {
    const { copied, copy } = useCopy({ resetAfterMs: 2000 })
    const envValue = `ATELIER_PRO_KEY=${licenseKey || "check your email"}`
    const t = useTranslations("docs.tooltips")
    return (
        <div className="flex flex-col min-h-screen items-center justify-start gap-y-5 relative z-2 px-4 w-full">
            <BackgroundPixelGrid
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 220%)` }}
                pixelSize={DEFAULT_PIXEL_SIZE}
            />

            <div className="z-2 w-full mt-[18vh] max-w-md p-10 rounded-xl bg-background/50 flex flex-col items-center justify-center">
                <div className="text-center space-y-1 mb-10">
                    <h1 className="text-lg font-medium">Thank you for your support! ♥️</h1>
                    <p className="text-sm text-mat-2">
                        You now have access to everything on atelier, forever.
                    </p>
                </div>

                <div className="w-full relative mb-10">
                    <code className="block bg-mat-5 px-4 py-3 pr-12 rounded-lg text-sm font-mono break-all">
                        {envValue}
                    </code>

                    <Tooltip title={t("copy")}>
                        <Button
                            variant="ghost-solid"
                            size="icon"
                            onClick={() => copy(envValue)}
                            aria-label="Copy license key"
                            className="absolute top-0 right-0 size-7"
                        >
                            {copied && <Check className="size-3.5" />}
                            {!copied && <Copy className="size-3.5" />}
                        </Button>
                    </Tooltip>
                </div>

                <Button asChild size="big" variant="secondary" className="mb-2 w-full gap-x-2">
                    <Link href="/docs">
                        Browse components
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>

                <Button asChild size="big" variant="ghost-transparent" className="gap-x-2 w-full">
                    <Link href="/docs/getting-started/installation">
                        Installation Guide
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>

                <p className="text-sm text-mat-2 text-center mt-5">
                    You can now add the license key to your .env.local file to access pro components
                    via CLI. Don't worry, you can also access it from your account.
                </p>
            </div>
        </div>
    )
}
