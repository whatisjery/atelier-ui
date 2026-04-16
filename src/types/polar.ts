export type PolarCustomer = {
    email: string
    customerId: string
    licenseKey: string | null
}

export type PolarAuthError = "email_failed" | "payment_failed"
