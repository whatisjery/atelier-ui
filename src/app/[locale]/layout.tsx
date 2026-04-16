import type { Metadata } from "next"
import "@/styles/globals.css"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { Tooltip } from "radix-ui"
import { ScrollRestorer } from "@/components/common/ScrollRestorer"
import { ThemeProvider } from "@/components/common/ThemeProvider"
import Toaster from "@/components/ui/Toaster"
import { routing } from "@/i18n/routing"
import { getCodeThemeColors } from "@/lib/shiki"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "latin-ext"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
    style: ["normal"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

const instrumentSans = Instrument_Serif({
    variable: "--font-instrument-serif",
    subsets: ["latin"],
    weight: ["400"],
    style: ["normal", "italic"],
})

export const metadata: Metadata = {
    title: {
        template: "%s — Atelier UI",
        default: "Atelier UI — Handcrafted React Animations & UI Components",
    },
    description:
        "A growing collection of handcrafted animations, effects, and interactive UI components for React, built with motion, tailwind css and react three fiber.",
    metadataBase: new URL("https://atelier-ui.com"),
    openGraph: {
        siteName: "Atelier UI",
        type: "website",
        locale: "en_US",
        images: "/images/og-image.jpg",
    },
    alternates: {
        canonical: "/",
        languages: {
            en: "/en",
        },
    },
    twitter: {
        card: "summary_large_image",
    },
}
type RootLayoutProps = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
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
            style={
                {
                    "--code-bg-light": colors.light,
                    "--code-bg-dark": colors.dark,
                } as React.CSSProperties
            }
        >
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} text-base font-sans antialiased bg-background text-mat-1 overflow-x-hidden`}
            >
                <NextIntlClientProvider>
                    <Tooltip.Provider>
                        <ThemeProvider attribute="class" enableSystem>
                            <ScrollRestorer />
                            <Toaster />
                            {children}
                        </ThemeProvider>
                    </Tooltip.Provider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
