import { redirect } from "next/navigation"
import AuthError from "@/components/features/auth/AuthError"
import type { PolarAuthError } from "@/types/polar"

type Props = {
    searchParams: Promise<{ error: PolarAuthError }>
}

export default async function ErrorPage({ searchParams }: Props) {
    const params = await searchParams

    if (!params.error) redirect("/")
    return <AuthError error={params.error} />
}
