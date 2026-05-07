import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    server: {
        POLAR_ACCESS_TOKEN: z.string().min(1),
        POLAR_ORGANIZATION_ID: z.string().min(1),
        RESEND_API_KEY: z.string().min(1),
        RESEND_FROM_EMAIL: z.email(),
        SESSION_SECRET: z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_SITE_URL: z.url(),
        NEXT_PUBLIC_POLAR_CHECKOUT_URL: z.url(),
    },
    runtimeEnv: {
        POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
        POLAR_ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        SESSION_SECRET: process.env.SESSION_SECRET,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_POLAR_CHECKOUT_URL: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL,
    },
})
