import { NextResponse } from "next/server"
import { clearPolarSessionCookie, getPolarCustomer, getPolarSession } from "@/lib/polar"

export async function GET() {
    const session = await getPolarSession()
    if (!session) return NextResponse.json({ customer: null })

    const customer = await getPolarCustomer()
    if (!customer) {
        await clearPolarSessionCookie()
        return NextResponse.json({ customer: null })
    }

    return NextResponse.json({ customer })
}
