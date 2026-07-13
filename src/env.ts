import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    client: {
        NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    },
    runtimeEnv: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
})
