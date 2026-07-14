"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import { getDocStatus } from "@/lib/utils"

type DocStatusBadgeProps = {
    createdAt?: string
}

export default function DocStatusBadge({ createdAt }: DocStatusBadgeProps) {
    const [label, setLabel] = useState<string | null>(null)

    useEffect(() => {
        setLabel(getDocStatus(createdAt))
    }, [createdAt])

    if (!label) return null

    return <Badge title={label} variant="neutral" />
}
