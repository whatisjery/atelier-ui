import Skeleton from "@/components/ui/Skeleton"

const FILTER_COUNT = 6
const CARD_COUNT = 20

export default function CatalogLoading() {
    return (
        <div className="flex flex-col min-w-0 w-full h-[calc(100vh-var(--spacing-nav-h))] overflow-hidden">
            <header className="sticky top-sticky z-3 flex items-center h-under-nav-h w-full border-b bg-bg px-5">
                <Skeleton className="h-6 w-40" />
            </header>

            <main className="w-full pb-50 px-5">
                <div className="not-prose">
                    <div className="flex items-center justify-between">
                        <div className="flex h-12 w-90 items-center py-10">
                            <Skeleton className="h-9 w-full rounded-lg" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 border-t border-b py-5">
                        {Array.from({ length: FILTER_COUNT }).map((_, index) => (
                            <Skeleton key={index} className="h-7 w-20 rounded-lg" />
                        ))}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: CARD_COUNT }).map((_, index) => (
                            <Skeleton key={index} className="aspect-[720/460] w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
