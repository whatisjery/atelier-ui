import { redirect } from "next/navigation"
import AuthLoginForm from "@/pro/components/features/auth/AuthLoginForm"
import { getSessionCustomer } from "@/pro/lib/auth/session"

export default async function LoginPage() {
    const customer = await getSessionCustomer()
    if (customer) redirect("/docs")

    return <AuthLoginForm />
}
