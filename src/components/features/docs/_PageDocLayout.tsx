"use client"

import SideRails from "@/components/common/SideRails"
import { cn } from "@/lib/utils"
import DocFooter from "./DocFooter"

type PageDocLayoutProps = {
    contentSlot: React.ReactNode
    demoSlot?: React.ReactNode
    TOCSlot?: React.ReactNode
    topBarSlot?: React.ReactNode
    navigationSlot?: React.ReactNode
    metadataSlot?: React.ReactNode
}

const paddingX = "md:px-20 px-5"
const Spacer = () => <span aria-hidden="true" className="max-xl:hidden w-94 shrink-0" />

export default function PageDocLayout({
    contentSlot,
    demoSlot,
    TOCSlot,
    metadataSlot,
    navigationSlot,
    topBarSlot,
}: PageDocLayoutProps) {
    const maxWidth = cn("mx-auto", TOCSlot ? "max-w-[80rem]" : "max-w-[90rem]")

    return (
        <SideRails className="flex flex-col min-w-0 w-full">
            <header className="flex top-sticky w-full border-b h-under-nav-h sticky bg-bg z-3">
                <div className={cn("w-full flex items-center", maxWidth, paddingX)}>
                    <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center min-w-0">{topBarSlot}</div>

                        <div className="flex items-center gap-x-1">{navigationSlot}</div>
                    </div>

                    <Spacer />
                </div>
            </header>

            <main
                className={cn(
                    "grid min-h-screen w-full pt-offset xl:grid-cols-[minmax(0,1fr)_21rem] xl:grid-rows-[auto_auto_1fr] xl:gap-x-10",
                    maxWidth,
                    paddingX,
                )}
            >
                {metadataSlot && (
                    <div className="max-xl:order-2 xl:col-start-1">{metadataSlot}</div>
                )}

                {demoSlot}

                {TOCSlot && (
                    <aside className="max-xl:hidden xl:col-start-2 xl:row-span-full">
                        <div className="flex flex-col xl:sticky xl:top-sticky-nested xl:max-h-[calc(100vh-var(--spacing-sticky-nested)-var(--spacing-offset))]">
                            {TOCSlot}
                        </div>
                    </aside>
                )}

                <article className="max-w-none min-w-0 prose relative pb-50 max-xl:order-4 xl:col-start-1">
                    {contentSlot}
                </article>
            </main>

            <footer className="w-full border-t h-30 sm:h-nav-h bg-bg z-2">
                <DocFooter className={cn(maxWidth, paddingX)} />
            </footer>
        </SideRails>
    )
}
