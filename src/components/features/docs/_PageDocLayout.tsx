"use client"

import { cn } from "@/lib/utils"
import DocFooter from "./DocFooter"

type PageDocLayoutProps = {
    contentSlot: React.ReactNode
    TOCSlot?: React.ReactNode
    topBarSlot?: React.ReactNode
    navigationSlot?: React.ReactNode
    metadataSlot?: React.ReactNode
}

const maxWidth = "max-w-[80rem] mx-auto"
const spacerWidth = "w-[25%]"
const paddingX = "md:px-20 px-5"

const Spacer = () => <span aria-hidden="true" className={cn("max-xl:hidden", spacerWidth)} />

export default function PageDocLayout({
    contentSlot,
    TOCSlot,
    metadataSlot,
    navigationSlot,
    topBarSlot,
}: PageDocLayoutProps) {
    return (
        <div className="flex flex-col min-w-0 w-full relative">
            <header className="flex top-sticky w-full border-b h-under-nav-h sticky bg-bg z-3">
                <div className={cn("w-full flex items-center", maxWidth, paddingX)}>
                    <div className="flex-1 flex items-center justify-between">
                        {topBarSlot}

                        <div className="flex items-center gap-x-1">{navigationSlot}</div>
                    </div>
                    {TOCSlot && <Spacer />}
                </div>
            </header>

            <div className="max-md:hidden pattern-line z-2 border-r h-full w-10 absolute left-0 bg-bg top-0" />
            <div className="max-md:hidden pattern-line z-2 border-l h-full w-10 absolute right-0 bg-bg top-0" />

            <main className={cn("flex min-h-screen w-full", maxWidth, paddingX)}>
                {contentSlot && (
                    <article className="max-w-none min-w-0 flex-1 prose relative pb-50 pt-offset">
                        {metadataSlot}
                        {contentSlot}
                    </article>
                )}

                {TOCSlot && (
                    <aside
                        className={cn(
                            "sticky h-fit max-xl:hidden pl-10 pt-offset flex-col justify-between top-sticky-nested",
                            spacerWidth,
                        )}
                    >
                        {TOCSlot}
                    </aside>
                )}
            </main>

            <footer className="w-full border-t h-30 sm:h-nav-h bg-bg z-2">
                <DocFooter className={cn("", maxWidth, paddingX)} />
                {TOCSlot && <Spacer />}
            </footer>
        </div>
    )
}
