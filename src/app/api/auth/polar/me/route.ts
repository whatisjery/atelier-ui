import { NextResponse } from "next/server"
import { clearPolarSessionCookie, getPolarCustomer } from "@/lib/polar"

export async function GET() {
    const customer = await getPolarCustomer()

    if (!customer) {
        await clearPolarSessionCookie()
        return NextResponse.json(
            { customer: null, error: "No active Polar license found" },
            { status: 401 },
        )
    }

    return NextResponse.json({ customer })
}
