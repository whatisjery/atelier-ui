"use client"

import { useState } from "react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"

type UseCopyOptions = {
    onSuccess?: () => void
    onError?: (error: Error) => void
    resetAfterMs?: number
}

export function useCopy(options?: UseCopyOptions) {
    const [copied, setCopied] = useState(false)

    const copy = async (text: string) => {
        if (copied) return

        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            options?.onSuccess?.()
            if (options?.resetAfterMs) {
                setTimeout(() => setCopied(false), options.resetAfterMs)
            }
        } catch (error) {
            toast.error(getErrorMessage(error))
            options?.onError?.(error as Error)
        }
    }

    return { copied, copy }
}
