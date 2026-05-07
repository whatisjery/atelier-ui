import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { env } from "@/env"
import { loginEmail } from "@/lib/email"
import { polar, signEmailToken } from "@/lib/polar"

const BASE_URL = env.NEXT_PUBLIC_SITE_URL
const RESEND = new Resend(env.RESEND_API_KEY)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/
const IP_LIMIT = 5
const EMAIL_LIMIT = 10

const ipLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(EMAIL_LIMIT, "1 h"),
    prefix: "magic-link:ip",
})

const emailLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(IP_LIMIT, "1 h"),
    prefix: "magic-link:email",
})

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon"
        const ipCheck = await ipLimiter.limit(ip)

        if (!ipCheck.success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 })
        }

        const { email } = await req.json()

        if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 })
        }

        const emailCheck = await emailLimiter.limit(email.toLowerCase())
        if (!emailCheck.success) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 })
        }

        const { result } = await polar.customers.list({
            organizationId: env.POLAR_ORGANIZATION_ID,
            email,
        })

        const customer = result.items[0]

        if (!customer) return NextResponse.json({ ok: true })

        const token = await signEmailToken(customer.id)
        const loginLink = `${BASE_URL}/api/auth/polar/from-email?token=${encodeURIComponent(token)}`

        await RESEND.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: email,
            subject: "Your Atelier UI login link",
            html: loginEmail(loginLink),
        })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: "Request failed" }, { status: 500 })
    }
}
