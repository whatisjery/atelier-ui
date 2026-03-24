"use client"

import { ArrowUpRight } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { SiGithub } from "react-icons/si"
import { Link } from "@/i18n/navigation"
import { BRAND, FOOTER_LINKS, REPO_URL, SOCIAL_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { PixelTrail } from "@/registry/base/pixel-trail/pixel-trail"
import Button from "../ui/Button"
import BrandLink from "./BrandLink"
import ThemeToggle from "./ThemeToggle"

export default function Footer() {
    const t = useTranslations("footer")
    const wrapperRef = useRef<HTMLElement>(null)
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => void setMounted(true), [])

    const { scrollYProgress } = useScroll({
        target: wrapperRef,
        offset: ["start end", "end end"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"])

    return (
        <footer ref={wrapperRef} className="z-2 relative overflow-hidden bg-background">
            <motion.div
                style={{ y }}
                className="xs:px-5 px-0 py-16 w-full relative overflow-hidden"
            >
                {mounted && (
                    <PixelTrail
                        gridColor={resolvedTheme === "dark" ? "#101010" : "#F4F4F4"}
                        color={resolvedTheme === "dark" ? "#19191B" : "#ECECEC"}
                        showGrid
                        fade={0}
                        className="absolute inset-0 w-full h-full z-1 top-[-0.12rem] border-t border-b"
                    />
                )}

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
                                {SOCIAL_LINKS.map(({ label, href, disabled }) => (
                                    <Link
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "hover:text-mat-1 text-mat-2 flex items-start",
                                            {
                                                "pointer-events-none opacity-[0.4]": disabled,
                                            },
                                        )}
                                        key={label}
                                        href={href}
                                        aria-disabled={disabled || undefined}
                                        tabIndex={disabled ? -1 : undefined}
                                    >
                                        <span>{label}</span>
                                        {!disabled && <ArrowUpRight className="size-2.5 mt-0.5" />}
                                        <span className="sr-only">({t("opens-in-new-tab")})</span>
                                    </Link>
                                ))}
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
                            <Button key="github" variant="ghost" size="icon" asChild>
                                <Link target="_blank" rel="noopener noreferrer" href={REPO_URL}>
                                    <SiGithub className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="w-full h-20 flex items-center justify-between">
                <div className="w-full text-center text-xs">
                    {t("all-rights-reserved", {
                        brand: BRAND,
                        year: new Date().getFullYear(),
                    })}
                </div>
            </div>
        </footer>
    )
}
