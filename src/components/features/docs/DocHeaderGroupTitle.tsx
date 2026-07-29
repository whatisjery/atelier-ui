import Badge from "@/components/ui/Badge"
import { cn } from "@/lib/utils"
import type { DocMeta } from "@/types/docs"

type DocHeaderGroupTitleProps = {
    meta: DocMeta
    className?: string
    showMetaTags?: boolean
    minimal?: boolean
}

export default function DocHeaderGroupTitle({
    meta,
    showMetaTags = false,
    className,
    minimal = false,
}: DocHeaderGroupTitleProps) {
    if (minimal) {
        return (
            <>
                <h1 className="font-semibold text-4xl tracking-tight mb-5">{meta.title}</h1>
                <p className="sr-only">{meta.description}</p>
            </>
        )
    }

    return (
        <div className={cn("not-prose items-start flex flex-col w-full mb-10", className)}>
            <h1 className="font-semibold text-4xl tracking-tight mb-1">{meta.title}</h1>
            <p className="text-lg text-accent-2">{meta.description}</p>

            {showMetaTags && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {meta.tags?.map((tag) => (
                        <Badge key={tag} title={tag} variant="neutral" />
                    ))}
                </div>
            )}
        </div>
    )
}
