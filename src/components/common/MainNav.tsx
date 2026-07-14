"use client"

import { useLenis } from "lenis/react"
import { ArrowUpRight, Menu, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import Brand from "@/components/common/Brand"
import GlobalSearch from "@/components/common/GlobalSearch"
import ThemeSwitcher from "@/components/common/ThemeSwitcher"
import ThemeToggle from "@/components/common/ThemeToggle"
import Button from "@/components/ui/Button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link, usePathname } from "@/i18n/navigation"
import { REPO_URL } from "@/lib/constants"
import { useGlobalStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
    { href: "/docs", labelKey: "read-the-docs" },
    { href: "/catalog", labelKey: "catalog" },
] as const

type MainNavProps = {
    className?: string
    /* Extra nav links, rendered between the built-in links and the GitHub link. */
    navSlot?: React.ReactNode
    /* Rendered at the far end of the bar, after the theme toggle. */
    endSlot?: React.ReactNode
}

export default function MainNav({ className, navSlot, endSlot }: MainNavProps) {
    const isMobile = useIsMobile(1024)
    const toggleSheetSidebar = useGlobalStore((state) => state.toggleSheetSidebar)
    const tCommon = useTranslations("common")
    const pathname = usePathname()
    const lenis = useLenis()

    return (
        <header className="w-full mx-auto bg-bg/99 sticky top-0 border-b z-10 left-0">
            <div
                className={cn(
                    "px-5 mx-auto w-full flex items-center justify-between h-nav-h",
                    className,
                )}
            >
                <div className="text-sm flex items-center space-x-4 font-light">
                    <Button
                        onClick={toggleSheetSidebar}
                        className="min-lg:hidden"
                        size="icon"
                        aria-label="Open sidebar"
                    >
                        <Menu className="size-5" />
                    </Button>

                    <Link href="/">
                        <Brand />
                    </Link>

                    <span className="h-5 w-px bg-accent-4 max-md:hidden"></span>

                    {!isMobile && <ThemeSwitcher />}

                    {!isMobile && (
                        <nav className="flex items-center gap-x-4.5 text-accent-2">
                            {NAV_LINKS.map(({ href, labelKey }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn("hover:text-accent-1", {
                                        "text-accent-1": pathname.includes(href),
                                    })}
                                >
                                    {tCommon(labelKey)}
                                </Link>
                            ))}

                            {navSlot}

                            <Link
                                href="/#pricing"
                                className="hover:text-accent-1 flex items-center"
                                onClick={(e) => {
                                    if (pathname !== "/") return
                                    e.preventDefault()
                                    lenis?.scrollTo("#pricing")
                                }}
                            >
                                {tCommon("pricing")}
                            </Link>

                            <Link
                                href={REPO_URL}
                                target="_blank"
                                className="hover:text-accent-1 flex items-center"
                            >
                                Github
                                <sup className="font-mono">
                                    <ArrowUpRight className="size-2.5 mt-0.5" />
                                </sup>
                            </Link>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-x-2">
                    <GlobalSearch>
                        {isMobile ? (
                            <Button size="icon" variant="tertiary" aria-label={tCommon("search")}>
                                <Search className="size-5" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                aria-label={tCommon("search")}
                                className="w-55 bg-accent-5 border border-accent-3 hover:border-accent-4 flex justify-between pr-1 pl-3 h-9"
                            >
                                <div className="flex items-center gap-x-2">
                                    <Search size={16} />
                                    <p className="font-regular">{tCommon("search")}</p>
                                </div>
                                <div className="flex text-accent-1 border items-center gap-x-1 bg-bg px-2 rounded-lg">
                                    <kbd className="pointer-events-none flex items-center">
                                        <span className="text-[1.1rem]">⌘</span>
                                        <span className="text-[0.8rem]">K</span>
                                    </kbd>
                                </div>
                            </Button>
                        )}
                    </GlobalSearch>

                    <ThemeToggle key="theme" />

                    {endSlot}
                </div>
            </div>
        </header>
    )
}
