import { redirect } from "next/navigation"
import { polar, setPolarSessionCookie } from "@/lib/polar"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const token = url.searchParams.get("customer_session_token")

    if (!token) redirect("/error?error=payment_failed")

    try {
        const user = await polar.customerPortal.customerSession.getAuthenticatedUser({
            customerSession: token,
        })

        let licenseKey: string | null = null

        const keys = await polar.customerPortal.licenseKeys.list({ customerSession: token }, {})
        if (keys.result.items.length > 0) {
            licenseKey = keys.result.items[0].key
        }

        if (user.customerId) await setPolarSessionCookie(user.customerId, licenseKey)
    } catch {
        redirect("/error?error=payment_failed")
    }

    redirect("/success")
}
