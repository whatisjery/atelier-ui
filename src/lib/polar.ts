import crypto from "node:crypto"
import { Polar } from "@polar-sh/sdk"
import { cookies } from "next/headers"
import type { PolarCustomer } from "@/types/polar"

const POLAR_SESSION_COOKIE = "polar_session"
const THIRTY_DAYS = 60 * 60 * 24 * 30

export const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN as string,
    server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
})

/**
 * Generates a signature for the given payload using the SESSION_SECRET.
 */
function sign(payload: string) {
    return crypto
        .createHmac("sha256", process.env.SESSION_SECRET as string)
        .update(payload)
        .digest("base64url")
}

/**
 * Encodes the given customerId and licenseKey into a base64url encoded string.
 */
function encodeSession(customerId: string, licenseKey: string | null) {
    const payload = Buffer.from(JSON.stringify({ customerId, licenseKey })).toString("base64url")
    return `${payload}.${sign(payload)}`
}

/**
 * Decodes the given cookie and returns the session if valid.
 * Returns null if the cookie is invalid or corrupted.
 */
function decodeSession(cookie: string): {
    customerId: string
    licenseKey: string | null
} | null {
    const [payload, signature] = cookie.split(".")

    if (!payload || !signature) return null

    const expected = sign(payload)
    const signatureB = Buffer.from(signature)
    const expectedB = Buffer.from(expected)

    if (signatureB.length !== expectedB.length || !crypto.timingSafeEqual(signatureB, expectedB)) {
        return null
    }

    try {
        const data = JSON.parse(Buffer.from(payload, "base64url").toString())
        if (typeof data.customerId !== "string") return null
        return {
            customerId: data.customerId,
            licenseKey: typeof data.licenseKey === "string" ? data.licenseKey : null,
        }
    } catch {
        return null
    }
}
/*
 * Sets the Polar session cookie with the given customerId and licenseKey.
 */
export async function setPolarSessionCookie(customerId: string, licenseKey: string | null) {
    const store = await cookies()

    store.set(POLAR_SESSION_COOKIE, encodeSession(customerId, licenseKey), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: THIRTY_DAYS,
    })
}

/*
 * Gets the Polar session from the cookie.
 */
export async function getPolarSession(): Promise<{
    customerId: string
    licenseKey: string | null
} | null> {
    const store = await cookies()
    const cookie = store.get(POLAR_SESSION_COOKIE)?.value

    if (!cookie) return null
    return decodeSession(cookie)
}

/*
 * Clears the Polar session cookie.
 */
export async function clearPolarSessionCookie() {
    const store = await cookies()
    store.delete(POLAR_SESSION_COOKIE)
}

/*
 * Gets the Polar customer from the session.
 */
export async function getPolarCustomer(): Promise<PolarCustomer | null> {
    const session = await getPolarSession()
    if (!session) return null

    try {
        const customer = await polar.customers.get({ id: session.customerId })
        return {
            email: customer.email ?? "",
            customerId: session.customerId,
            licenseKey: session.licenseKey,
        }
    } catch (error) {
        console.error(error)
        return null
    }
}
