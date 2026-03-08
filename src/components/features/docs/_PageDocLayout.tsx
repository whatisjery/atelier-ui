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
        <div className="flex w-full">
            <main className="pt-offset-top w-full flex flex-col min-w-0">
                <div className="max-w-doc-w w-full mx-auto lg:px-10 px-5 prose text-mat-1 prose-h2:mt-9">
                    {headerSlot && headerSlot}

                    {contentSlot && (
                        <article className="[&>*:first-child]:mt-0 relative pb-30 mt-8">
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
