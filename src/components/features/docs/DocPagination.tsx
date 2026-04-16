"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { Fragment } from "react/jsx-runtime"
import { Link } from "@/i18n/navigation"
import type { DocNavigation } from "@/types/docs"

type DocPaginationProps = { navigation: DocNavigation }

const LINKS = [
    { key: "prev", icon: ArrowLeft, position: "left" },
    { key: "next", icon: ArrowRight, position: "right" },
] as const

export default function DocPagination({ navigation }: DocPaginationProps) {
    return (
        <nav className="not-prose flex items-center justify-center gap-x-4 mb-30">
            {LINKS.map(({ key, icon: Icon, position }, index) => {
                const item = navigation[key]
                if (!item) return null

                return (
                    <Fragment key={key}>
                        {index > 0 && <span className="text-sm">&mdash;</span>}
                        <Link
                            className="text-sm flex w-fit items-center gap-x-2 hover:opacity-50"
                            href={item.url}
                        >
                            {position === "left" && <Icon className="size-4" />}
                            {item.title}
                            {position === "right" && <Icon className="size-4" />}
                        </Link>
                    </Fragment>
                )
            })}
        </nav>
    )
}
