"use client"

import Link from "next/link"

import { useState } from "react"

type HoverPrefetchLinkProps = React.ComponentProps<typeof Link>

/*
 * A `next/link` that waits for intent before prefetching, following the
 * "Hover-triggered prefetch" pattern in the Next.js docs:
 * https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch
 */
export default function HoverPrefetchLink({
    onMouseEnter,
    onTouchStart,
    onFocus,
    ...rest
}: HoverPrefetchLinkProps) {
    const [intent, setIntent] = useState(false)

    return (
        <Link
            {...rest}
            prefetch={intent ? null : false}
            onMouseEnter={(event) => {
                setIntent(true)
                onMouseEnter?.(event)
            }}
            onTouchStart={(event) => {
                setIntent(true)
                onTouchStart?.(event)
            }}
            onFocus={(event) => {
                setIntent(true)
                onFocus?.(event)
            }}
        />
    )
}
