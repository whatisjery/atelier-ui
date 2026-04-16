"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { getErrorMessage } from "@/lib/utils"
import type { PolarCustomer } from "@/types/polar"

/*
 * Plain function so it can be imported without triggering the customer fetch.
 */
export async function signIn(email: string) {
    const res = await fetch("/api/auth/polar/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error ?? "Something went wrong")

    return data.ok
}

export function usePolarCustomer() {
    const [customer, setCustomer] = useState<PolarCustomer | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchPolarCustomer() {
            try {
                const res = await fetch("/api/auth/polar/me")
                const data = await res.json()

                if (!res.ok) return

                setCustomer(data.customer)
            } catch (err) {
                toast.error(getErrorMessage(err))
            } finally {
                setIsLoading(false)
            }
        }

        fetchPolarCustomer()
    }, [])

    async function signOut() {
        try {
            await fetch("/api/auth/polar/logout", { method: "POST" })
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
        setCustomer(null)
        router.push("/")
        router.refresh()
    }

    return {
        customer,
        isLoading,
        signOut,
    }
}
