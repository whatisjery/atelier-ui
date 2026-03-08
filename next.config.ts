// next.config.ts

import createMDX from "@next/mdx"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

    async redirects() {
        return [
            {
                source: "/:locale/docs/getting-started",
                destination: "/:locale/docs/getting-started/installation",
                permanent: true,
            },
        ]
    },
}

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
    options: {
        remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter", "remark-gfm"],
        rehypePlugins: ["rehype-mdx-code-props"],
    },
})

const withNextIntl = createNextIntlPlugin()

export default withMDX(withNextIntl(nextConfig))
