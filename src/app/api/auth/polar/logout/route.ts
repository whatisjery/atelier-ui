import { NextResponse } from "next/server"
import { clearPolarSessionCookie } from "@/lib/polar"

export async function POST() {
    await clearPolarSessionCookie()
    return NextResponse.json({ ok: true })
}
