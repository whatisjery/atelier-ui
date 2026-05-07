import "@/styles/globals.css"
import { Geist, Instrument_Serif } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { ThemeProvider } from "@/components/common/ThemeProvider"
import { routing } from "@/i18n/routing"

const fontSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "latin-ext"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
    style: ["normal"],
})

const serif = Instrument_Serif({
    variable: "--font-instrument-serif",
    subsets: ["latin"],
    weight: ["400"],
    style: ["normal", "italic"],
})

type PreviewLayoutProps = {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}

export default async function PreviewLayout({ children, params }: PreviewLayoutProps) {
    const { locale } = await params
    setRequestLocale(locale)

    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    return (
        <html className="scrollbar-overlay" lang={locale} suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${serif.variable} text-base font-sans antialiased bg-bg text-accent-1 overflow-x-hidden`}
            >
                <ThemeProvider attribute="class" enableSystem>
                    <NextIntlClientProvider>{children}</NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
