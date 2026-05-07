import { redirect } from "next/navigation"
import { polar, setPolarSessionCookie } from "@/lib/polar"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const checkoutId = url.searchParams.get("checkout_id")

    if (!checkoutId) redirect("/")

    let customerId: string | null = null
    let licenseKey: string | null = null

    try {
        const checkout = await polar.checkouts.get({ id: checkoutId })
        customerId = checkout.customerId

        if (customerId) {
            const grants = await polar.benefitGrants.list({ customerId })
            const licenseKeyId = grants.result.items
                .map((grant) => (grant.properties as { licenseKeyId?: string }).licenseKeyId)
                .find(Boolean)

            if (licenseKeyId) {
                const key = await polar.licenseKeys.get({ id: licenseKeyId })
                licenseKey = key.key
            }
        }
    } catch (error) {
        console.error("error in polar from checkout", error)
        redirect("/error?error=payment_failed")
    }

    if (!customerId) redirect("/error?error=payment_failed")

    await setPolarSessionCookie(customerId, licenseKey)
    redirect("/success")
}
