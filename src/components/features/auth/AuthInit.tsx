"use client"

import { useEffect } from "react"
import { useGlobalStore } from "@/lib/store"

export default function AuthInit() {
    const setCustomer = useGlobalStore((s) => s.setCustomer)

    useEffect(() => {
        async function fetchPolarCustomer() {
            try {
                const res = await fetch("/api/auth/polar/me")
                const data = await res.json()

                if (!res.ok) return

                setCustomer(data.customer)
            } catch (err) {
                console.error("Failed to load customer:", err)
            }
        }

        fetchPolarCustomer()
    }, [setCustomer])

    return null
}
