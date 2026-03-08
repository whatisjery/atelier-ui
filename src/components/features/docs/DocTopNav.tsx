"use client"

import { Menu, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { SiGithub } from "react-icons/si"
import GlobalSearch from "@/components/common/GlobalSearch"
import Logo from "@/components/common/Logo"
import RouteBreadCrumb from "@/components/common/RouteBreadCrumb"
import ThemeToggle from "@/components/common/ThemeToggle"
import Badge from "@/components/ui/Badge"
import Border from "@/components/ui/Border"
import Button from "@/components/ui/Button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link, usePathname } from "@/i18n/navigation"
import { BRAND, REPO_URL, TEMP_NAV_LINKS } from "@/lib/constants"
import { useGlobalStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function DocTopNav() {
    const pathname = usePathname()
    const isMobile = useIsMobile(1024)
    const { toggleSidebar } = useGlobalStore()
    const t = useTranslations("docs.links")
    const tCommon = useTranslations("common")

    return (
        <header className="w-full fixed top-0 z-20 left-0 bg-background/70 backdrop-blur-sm">
            <Border direction="horizontal" className="bottom-0 !bg-border/65" />

            <div className="max-w-doc-max-w px-5 mx-auto flex flex-col h-nav-h justify-between">
                <div className="flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] items-center h-[60%] w-full">
                    <Link
                        href="/"
                        className="text-xl flex items-center gap-2 justify-self-start font-serif"
                    >
                        <Logo size={20} />
                        {BRAND}
                    </Link>

                    {!isMobile && (
                        <GlobalSearch
                            triggerSlot={({ onClick }) => (
                                <Button
                                    type="button"
                                    aria-label={tCommon("search")}
                                    onClick={onClick}
                                    className="w-85 bg-mat-5 border hover:border-mat-1/15 cursor-pointer h-11 text-sm rounded-xl text-mat-2 hover:text-mat-1 flex items-center justify-between px-4 space-x-2"
                                >
                                    <div className="flex items-center gap-x-2">
                                        <Search size={16} />
                                        <p className="font-regular">{tCommon("search")}</p>
                                    </div>

                                    <div className="flex text-mat-1 border items-center gap-x-1 bg-background px-2 rounded-lg">
                                        <kbd className="pointer-events-none flex items-center">
                                            <span className="text-[1.1rem]">⌘</span>
                                            <span className="text-[0.8rem]">K</span>
                                        </kbd>
                                    </div>
                                </Button>
                            )}
                        />
                    )}

                    {!isMobile && (
                        <div className="flex items-center justify-end">
                            <ThemeToggle key="theme" />

                            <Button key="github" variant="ghost" size="icon" asChild>
                                <Link href={REPO_URL}>
                                    <SiGithub className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    {isMobile && (
                        <GlobalSearch
                            triggerSlot={({ onClick }) => (
                                <Button onClick={onClick} size="icon" variant="ghost">
                                    <Search className="size-5" />
                                </Button>
                            )}
                        />
                    )}
                </div>

                <nav className="flex gap-x-6 items-center w-full h-[40%] text-sm relative">
                    <Border direction="horizontal" className="top-0 !bg-border/65" />

                    <Button
                        className="lg:hidden flex -ml-2 cursor-pointer"
                        onClick={toggleSidebar}
                        variant="ghost"
                        size="icon"
                    >
                        <Menu className="size-4" />
                    </Button>

                    <RouteBreadCrumb className="lg:hidden" />

                    {TEMP_NAV_LINKS.map(({ key, href, wip }) => {
                        const isActive = pathname.includes(href)

                        return (
                            <Link
                                key={key}
                                className={cn(
                                    "relative h-full items-center lg:flex hidden",
                                    "after:absolute after:left-0 after:-bottom-[1px] after:h-[1px] after:w-full after:bg-highlight",
                                    {
                                        "text-mat-1 font-semibold after:scale-x-100": isActive,
                                        "text-mat-2 font-medium after:scale-x-0": !isActive,
                                        "cursor-not-allowed": wip,
                                    },
                                )}
                                href={href}
                            >
                                {t(key)}

                                {wip && (
                                    <Badge title={tCommon("wip")} className="ml-3" variant="wip" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
