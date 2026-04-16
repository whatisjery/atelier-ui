import { redirect } from "next/navigation"
import AuthSuccessPanel from "@/components/features/auth/AuthSuccessPanel"
import { getPolarSession } from "@/lib/polar"

export default async function SuccessPage() {
    const session = await getPolarSession()

    if (!session) redirect("/login")

    return <AuthSuccessPanel licenseKey={session.licenseKey} />
}
