import type { Metadata } from "next"
import "@/styles/globals.css"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Tooltip } from "radix-ui"
import { ScrollRestorer } from "@/components/common/ScrollRestorer"
import { ThemeProvider } from "@/components/common/ThemeProvider"
import { ThemeSync } from "@/components/common/ThemeSync"
import AuthInit from "@/components/features/auth/AuthInit"
import Toaster from "@/components/ui/Toaster"
import { routing } from "@/i18n/routing"
import { getCodeThemeColors } from "@/lib/shiki"

const fontSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "latin-ext"],
    display: "swap",
    weight: ["200", "300", "400", "500", "600", "700"],
    style: ["normal"],
})

const fontMono = Geist_Mono({
    variable: "--font-suse-mono",
    subsets: ["latin"],
    weight: ["300", "400"],
    style: ["normal"],
})

const serif = Instrument_Serif({
    variable: "--font-instrument-serif",
    subsets: ["latin"],
    weight: ["400"],
    style: ["normal", "italic"],
})

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const tMetadata = await getTranslations({ locale, namespace: "metadata" })

    return {
        title: tMetadata("title"),
        description: tMetadata("description"),
        metadataBase: new URL("https://atelier-ui.com"),
        openGraph: {
            siteName: "Atelier UI",
            type: "website",
            locale: "en_US",
            images: [{ url: "/images/og_img_light.jpg", width: 1200, height: 630 }],
        },
        alternates: { canonical: `/${locale}`, languages: { en: "/en", "x-default": "/en" } },
        twitter: { card: "summary_large_image" },
    }
}

type AppLayoutProps = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function AppLayout({ children, params }: AppLayoutProps) {
    const { locale } = await params
    setRequestLocale(locale)

    const colors = await getCodeThemeColors()

    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className="scrollbar-overlay"
            style={
                {
                    "--code-bg-light": colors.light,
                    "--code-bg-dark": colors.dark,
                } as React.CSSProperties
            }
        >
            <body
                className={`${fontSans.variable} ${fontMono.variable} ${serif.variable} text-base font-sans antialiased bg-bg text-accent-1 overflow-x-hidden`}
            >
                <ThemeProvider attribute="class" enableSystem>
                    <NextIntlClientProvider>
                        <Tooltip.Provider>
                            <ThemeSync />
                            <ScrollRestorer />
                            <Toaster />
                            <AuthInit />
                            {children}
                        </Tooltip.Provider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
