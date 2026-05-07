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
    const tAuth = useTranslations("auth.success")
    const envValue = `ATELIER_PRO_KEY=${licenseKey}`

    return (
        <div className="flex flex-col min-h-screen items-center justify-start gap-y-5 relative z-2 px-4 w-full">
            <BackgroundPixelGrid
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 220%)` }}
                pixelSize={DEFAULT_PIXEL_SIZE}
            />

            <div className="z-2 w-full mt-[18vh] max-w-md p-10 rounded-xl bg-bg/50 flex flex-col items-center justify-center">
                <div className="text-center space-y-1 mb-10">
                    <h1 className="text-lg font-medium">{tAuth("title")}</h1>
                    <p className="text-sm text-accent-2">{tAuth("subtitle")}</p>
                </div>

                <div className="w-full relative mb-10">
                    <code className="block bg-accent-5 px-4 py-3 pr-12 rounded-lg text-sm font-mono break-all">
                        {envValue}
                    </code>

                    <Tooltip title="Copy">
                        <Button
                            variant="tertiary"
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

                <Button asChild variant="secondary" className="gap-x-2 w-full">
                    <Link href="/docs/getting-started/installation">
                        {tAuth("installation-guide")}
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>

                <p className="text-sm text-accent-2 text-center mt-5">{tAuth("footer-note")}</p>
            </div>
        </div>
    )
}
