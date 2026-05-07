"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Brand from "@/components/common/Brand"
import Button from "@/components/ui/Button"
import BackgroundPixelGrid from "@/components/ui/PixelGrid"
import { DEFAULT_PIXEL_SIZE } from "@/lib/constants"

export default function NotFound() {
    const pathname = usePathname()

    return (
        <div className="flex text-xl min-h-screen items-center justify-center  w-full">
            <div className="relative z-5 flex flex-col items-center justify-center gap-y-4">
                <Brand />

                <span className="relative z-5">
                    Hmm, <span className="font-mono border p-1 rounded-md">{pathname}</span> does
                    not exist on our site.
                </span>
                <Button variant="secondary" className="relative z-5" asChild>
                    <Link href="/">Return home</Link>
                </Button>
            </div>

            <BackgroundPixelGrid
                pixelSize={DEFAULT_PIXEL_SIZE}
                style={{ maskImage: `linear-gradient(to bottom, transparent 0%, black 190%)` }}
            />
        </div>
    )
}
