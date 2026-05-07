import { redirect } from "next/navigation"
import { polar, setPolarSessionCookie, verifyEmailToken } from "@/lib/polar"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) redirect("/")

    const customerId = await verifyEmailToken(token)

    if (!customerId) redirect("/error?error=email_failed")

    let licenseKey: string | null = null

    try {
        const grants = await polar.benefitGrants.list({ customerId })
        const licenseKeyId = grants.result.items
            .map((grant) => (grant.properties as { licenseKeyId?: string }).licenseKeyId)
            .find(Boolean)

        if (licenseKeyId) {
            const key = await polar.licenseKeys.get({ id: licenseKeyId })
            licenseKey = key.key
        }
    } catch (error) {
        console.error("error in polar from email", error)
        redirect("/error?error=email_failed")
    }

    await setPolarSessionCookie(customerId, licenseKey)
    redirect("/docs")
}
