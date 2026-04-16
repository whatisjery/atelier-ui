import { redirect } from "next/navigation"
import { polar, setPolarSessionCookie } from "@/lib/polar"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) redirect("/error?error=email_failed")

    let customerId: string | null = null
    let licenseKey: string | null = null

    try {
        const user = await polar.customerPortal.customerSession.getAuthenticatedUser({
            customerSession: token,
        })
        customerId = user.customerId

        const keys = await polar.customerPortal.licenseKeys.list({ customerSession: token }, {})

        if (keys.result.items.length > 0) {
            licenseKey = keys.result.items[0].key
        }
    } catch (error) {
        console.log("error in polar from email", error)
        redirect("/error?error=email_failed")
    }

    if (!customerId) redirect("/error?error=email_failed")

    await setPolarSessionCookie(customerId, licenseKey)
    redirect("/docs")
}
