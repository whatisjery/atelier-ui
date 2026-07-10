import { redirect } from "next/navigation"
import AuthSuccessPanel from "@/pro/components/features/auth/AuthSuccessPanel"
import { getSessionCustomer } from "@/pro/lib/auth/session"

export default async function SuccessPage() {
    const customer = await getSessionCustomer()

    if (!customer) redirect("/login")

    return <AuthSuccessPanel licenseKey={customer.licenseKey} />
}
