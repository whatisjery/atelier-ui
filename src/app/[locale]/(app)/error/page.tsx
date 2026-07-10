import { redirect } from "next/navigation"
import AuthError from "@/pro/components/features/auth/AuthError"
import { NO_LICENSE } from "@/pro/lib/auth/errors"
import type { PolarAuthError } from "@/types/polar"

type Props = {
    searchParams: Promise<{ error: string }>
}

export default async function ErrorPage({ searchParams }: Props) {
    const params = await searchParams

    if (!params.error) redirect("/")

    let error: PolarAuthError = "email_failed"
    if (params.error === "payment_failed") error = "payment_failed"
    if (params.error === NO_LICENSE) error = "no_license"

    return <AuthError error={error} />
}
