import type { MetadataRoute } from "next"

const BASE_URL = "https://atelier-ui.com"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/preview/", "/success", "/error"],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    }
}
