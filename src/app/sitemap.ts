import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { getAllDocs } from "@/lib/docs"

const BASE_URL = "https://atelier-ui.com"

const STATIC_PATHS = ["", "/docs", "/login"] as const

export default function sitemap(): MetadataRoute.Sitemap {
    const staticEntries = routing.locales.flatMap((locale) =>
        STATIC_PATHS.map((path) => ({
            url: `${BASE_URL}/${locale}${path}`,
            lastModified: new Date(),
        })),
    )

    const docEntries = getAllDocs().map(({ locale, slug }) => ({
        url: `${BASE_URL}/${locale}/docs/${slug.join("/")}`,
        lastModified: new Date(),
    }))

    return [...staticEntries, ...docEntries]
}
