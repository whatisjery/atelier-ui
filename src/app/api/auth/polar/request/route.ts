import { NextResponse } from "next/server"
import { Resend } from "resend"
import { loginEmail } from "@/lib/email"
import { polar } from "@/lib/polar"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
const RESEND = new Resend(process.env.RESEND_API_KEY)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 })
        }

        const { result } = await polar.customers.list({
            organizationId: process.env.POLAR_ORGANIZATION_ID as string,
            email,
        })

        const customer = result.items[0]

        if (!customer) return NextResponse.json({ ok: true })

        const { token } = await polar.customerSessions.create({
            customerId: customer.id,
        })

        if (!token) {
            return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
        }

        const loginLink = `${BASE_URL}/api/auth/polar/from-email?token=${encodeURIComponent(token)}`

        await RESEND.emails.send({
            from: process.env.RESEND_FROM_EMAIL as string,
            to: email,
            subject: "Your Atelier UI login link",
            html: loginEmail(loginLink),
        })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: "Request failed" }, { status: 500 })
    }
}
