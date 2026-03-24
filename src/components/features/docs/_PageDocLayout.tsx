"use client"

type PageDocLayoutProps = {
    contentSlot: React.ReactNode
    TOCSlot?: React.ReactNode
    bottomSlot?: React.ReactNode
    headerSlot?: React.ReactNode
}

export default function PageDocLayout({
    contentSlot,
    TOCSlot,
    headerSlot,
    bottomSlot,
}: PageDocLayoutProps) {
    return (
        <div className="flex w-full min-w-0">
            <main className="pt-offset-top flex-1 flex flex-col min-w-0">
                <div className="min-w-0 lg:px-15 px-3 prose max-w-none text-mat-1 prose-h2:mt-9">
                    {headerSlot && headerSlot}

                    {contentSlot && (
                        <article className="[&>*:first-child]:mt-0 w-full relative pb-30 mt-8">
                            {contentSlot}
                        </article>
                    )}
                    {bottomSlot && bottomSlot}
                </div>
            </main>

            <aside className="sticky xl:flex hidden flex-col justify-between top-offset-top text-sm min-w-70 max-h-aside-h">
                {TOCSlot}
            </aside>
        </div>
    )
}
