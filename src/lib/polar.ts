import { Polar } from "@polar-sh/sdk"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { env } from "@/env"
import type { PolarCustomer } from "@/types/polar"

const POLAR_SESSION_COOKIE = "polar_session"
const THIRTY_DAYS = 60 * 60 * 24 * 30

export const polar = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
})

const jwtSecret = new TextEncoder().encode(env.SESSION_SECRET)

/**
 * Signs a short-lived JWT for email login links.
 */
export async function signEmailToken(customerId: string) {
    return await new SignJWT({ customerId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(jwtSecret)
}

/**
 * Verifies a JWT from an email login link and returns the customerId if valid.
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, jwtSecret)
        return typeof payload.customerId === "string" ? payload.customerId : null
    } catch {
        return null
    }
}

/*
 * Sets the Polar session cookie with the given customerId and licenseKey.
 */
export async function setPolarSessionCookie(customerId: string, licenseKey: string | null) {
    const token = await new SignJWT({ customerId, licenseKey })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(jwtSecret)

    const store = await cookies()

    store.set(POLAR_SESSION_COOKIE, token, {
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

    try {
        const { payload } = await jwtVerify(cookie, jwtSecret)
        if (typeof payload.customerId !== "string") return null
        return {
            customerId: payload.customerId,
            licenseKey: typeof payload.licenseKey === "string" ? payload.licenseKey : null,
        }
    } catch {
        return null
    }
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
