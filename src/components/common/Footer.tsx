"use client"

import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { SiGithub } from "react-icons/si"
import { Link } from "@/i18n/navigation"
import { BRAND, DEFAULT_PIXEL_SIZE, REPO_URL, SUPPORT_EMAIL, VERSION } from "@/lib/constants"
import Button from "../ui/Button"
import BackgroundPixelGrid from "../ui/PixelGrid"
import BrandLink from "./BrandLink"
import ThemeToggle from "./ThemeToggle"

export const FOOTER_LINKS = [
    {
        key: "docs",
        href: "/docs",
    },
    {
        key: "getting-started",
        href: "/docs/getting-started",
    },
    {
        key: "components",
        href: "/docs",
    },
    {
        key: "contribute",
        href: "/docs/getting-started/contribution",
    },
] as const

export default function Footer() {
    const t = useTranslations("footer")

    return (
        <footer className="z-2 relative overflow-hidden bg-background">
            <div className="xs:px-5 px-0 py-16 w-full relative overflow-hidden">
                <BackgroundPixelGrid pixelSize={DEFAULT_PIXEL_SIZE} />

                <div className="bg-background/70 border border-border/50 backdrop-blur-[1.5px] z-2 relative flex flex-col gap-y-28 p-5 rounded-sm max-w-[37rem] mx-auto">
                    <div className="flex items-start text-sm xs:flex-row flex-col gap-y-10">
                        <BrandLink />

                        <div className="flex gap-16 xs:mr-[8%] xs:ml-auto capitalize">
                            <nav className="flex flex-col gap-2" aria-label={t("pages")}>
                                <h4>{t("pages")}</h4>
                                {FOOTER_LINKS.map(({ key, href }) => (
                                    <Link className="external-link-hover" key={key} href={href}>
                                        <span>{t(key)}</span>
                                    </Link>
                                ))}
                            </nav>

                            <nav className="flex flex-col gap-2" aria-label={t("social")}>
                                <h4>{t("social")}</h4>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-mat-1 text-mat-2 flex items-start"
                                    key="github"
                                    href={REPO_URL}
                                >
                                    <span>Github</span>
                                    <ArrowUpRight className="size-2.5 mt-0.5" />
                                    <span className="sr-only">({t("opens-in-new-tab")})</span>
                                </Link>

                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-mat-1 text-mat-2 flex items-start"
                                    key="support"
                                    href={`mailto:${SUPPORT_EMAIL}`}
                                >
                                    <span>Support</span>
                                    <ArrowUpRight className="size-2.5 mt-0.5" />
                                    <span className="sr-only">({t("opens-in-new-tab")})</span>
                                </Link>
                            </nav>
                        </div>
                    </div>

                    <div className="flex xs:items-center xs:justify-between xs:flex-row flex-col gap-y-10">
                        <small className="text-mat-2 text-sm">
                            <span className="block mb-1">
                                {t.rich("design-and-built-by", {
                                    name: () => (
                                        <Link
                                            className="underline hover:no-underline"
                                            href="https://jeremienallet.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Jérémie Nallet opens in new tab`}
                                        >
                                            Jérémie Nallet
                                        </Link>
                                    ),
                                })}
                            </span>
                            <span>{t("location")}</span>
                        </small>

                        <div className="ml-auto flex items-center">
                            <ThemeToggle key="theme" />

                            <Button key="github" variant="ghost-solid" size="icon" asChild>
                                <Link target="_blank" rel="noopener noreferrer" href={REPO_URL}>
                                    <SiGithub className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-20 flex gap-x-10 text-mat-2 items-center justify-center text-[0.6rem] font-mono uppercase">
                <div className="flex flex-col items-center justify-center">
                    <span>
                        {BRAND} version {VERSION} &copy;{new Date().getFullYear()}
                    </span>
                    <span>all rights reserved</span>
                </div>
            </div>
        </footer>
    )
}
