import { redirect } from "next/navigation"
import AuthLoginForm from "@/components/features/auth/AuthLoginForm"
import { getPolarSession } from "@/lib/polar"

export default async function LoginPage() {
    const session = await getPolarSession()
    if (session) redirect("/docs")

    return <AuthLoginForm />
}
