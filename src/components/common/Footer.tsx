"use client"

import { ArrowUpRight, Coffee } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import { useTranslations } from "next-intl"
import { type ComponentRef, useRef } from "react"
import { SiGithub } from "react-icons/si"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link } from "@/i18n/navigation"
import { BRAND, BUY_ME_A_COFFEE_URL, REPO_URL, SUPPORT_EMAIL } from "@/lib/constants"
import Button from "../ui/Button"
import Card from "../ui/Card"
import Brand from "./Brand"
import ThemeToggle from "./ThemeToggle"

export const FOOTER_LINKS = [
    { key: "docs", href: "/docs" },
    { key: "getting-started", href: "/docs/getting-started" },
    { key: "components", href: "/docs" },
    { key: "contribute", href: "/docs/getting-started/contribution" },
] as const

export default function Footer() {
    const footerRef = useRef<ComponentRef<"footer">>(null)
    const tFooter = useTranslations("footer")
    const tCommon = useTranslations("common")
    const isMobile = useIsMobile(640)

    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"])

    return (
        <footer ref={footerRef} className="overflow-hidden border-t text-sm">
            <motion.div
                style={isMobile ? undefined : { y }}
                className="px-3 sm:px-7 py-18 w-full relative pattern-line border-b"
            >
                <Card className="z-2 relative flex flex-col gap-y-28 max-w-[37rem] mx-auto">
                    <div className="flex items-start xs:flex-row h-full flex-col gap-y-10 p-5">
                        <Brand version />

                        <div className="flex gap-16 xs:mr-[8%] xs:ml-auto capitalize">
                            <nav className="flex flex-col gap-2" aria-label={tFooter("pages")}>
                                <h3>{tFooter("pages")}</h3>

                                {FOOTER_LINKS.map(({ key, href }) => (
                                    <Link
                                        className="hover:text-accent-1 text-accent-2"
                                        key={key}
                                        href={href}
                                    >
                                        <span>{tFooter(key)}</span>
                                    </Link>
                                ))}
                            </nav>

                            <nav className="flex flex-col gap-2" aria-label={tFooter("social")}>
                                <h3>{tFooter("social")}</h3>

                                <Link
                                    target="_blank"
                                    aria-label="GitHub repository, opens in new tab"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent-1 text-accent-2 flex items-start"
                                    href={REPO_URL}
                                >
                                    <span>Github</span>
                                    <ArrowUpRight className="size-2.5 mt-0.5" />
                                    <span className="sr-only">({tFooter("opens-in-new-tab")})</span>
                                </Link>

                                <Link
                                    target="_blank"
                                    aria-label="Support email, opens in new tab"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent-1 text-accent-2 flex items-start"
                                    href={`mailto:${SUPPORT_EMAIL}`}
                                >
                                    <span>{tCommon("support")}</span>
                                    <ArrowUpRight className="size-2.5 mt-0.5" />
                                    <span className="sr-only">({tFooter("opens-in-new-tab")})</span>
                                </Link>
                            </nav>
                        </div>
                    </div>

                    <div className="flex xs:items-center border-t border-dashed xs:justify-between xs:flex-row flex-col p-5">
                        <small className="text-accent-2 text-sm">
                            <span className="block mb-1">
                                {tFooter.rich("design-and-built-by", {
                                    name: () => (
                                        <Link
                                            className="underline hover:no-underline"
                                            href="https://jeremienallet.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Jérémie Nallet opens in new tab"
                                        >
                                            Jérémie Nallet
                                        </Link>
                                    ),
                                })}
                            </span>
                            <span>In Paris, France 🇫🇷</span>
                        </small>

                        <div className="flex items-center">
                            <ThemeToggle key="theme" />

                            <Button variant="tertiary" size="icon" asChild>
                                <a
                                    aria-label="GitHub repository, opens in new tab"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={REPO_URL}
                                >
                                    <SiGithub className="size-4" />
                                </a>
                            </Button>

                            <Button variant="tertiary" size="icon" asChild>
                                <a
                                    aria-label="Support on Buy Me a Coffee, opens in new tab"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={BUY_ME_A_COFFEE_URL}
                                >
                                    <Coffee className="size-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <div className="w-fit mx-auto h-20 flex gap-x-10 items-center font-mono text-xs uppercase">
                {new Date().getFullYear()} {BRAND} All rights reserved.
            </div>
        </footer>
    )
}
