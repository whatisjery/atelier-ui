export async function signOut() {
    const res = await fetch("/api/auth/polar/logout", { method: "POST" })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Something went wrong")
    }
}

export async function signIn(email: string) {
    const res = await fetch("/api/auth/polar/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Something went wrong")
    }
}
