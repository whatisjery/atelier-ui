"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import { GIT_DAYS_THRESHOLD } from "@/lib/constants"

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function getDocStatus(createdAt?: string) {
    if (!createdAt) return null

    const now = Date.now()
    const created = new Date(createdAt).getTime()

    if ((now - created) / MS_PER_DAY < GIT_DAYS_THRESHOLD) {
        return "new"
    }

    return null
}

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
