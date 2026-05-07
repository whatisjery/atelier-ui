"use client"

import { ArrowUpRight, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import Brand from "@/components/common/Brand"
import GlobalSearch from "@/components/common/GlobalSearch"
import ThemeSwitcher from "@/components/common/ThemeSwitcher"
import ThemeToggle from "@/components/common/ThemeToggle"
import AuthAccountDropdown from "@/components/features/auth/AuthAccountDropdown"
import AuthGuestDropdown from "@/components/features/auth/AuthGuestDropdown"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { Link, usePathname } from "@/i18n/navigation"
import { REPO_URL } from "@/lib/constants"
import { useGlobalStore } from "@/lib/store"
import { cn } from "@/lib/utils"

type MainNavProps = {
    className?: string
}

export default function MainNav({ className }: MainNavProps) {
    const isMobile = useIsMobile(1024)
    const customer = useGlobalStore((s) => s.customer)
    const isCustomerPending = useGlobalStore((s) => s.isCustomerPending)
    const tCommon = useTranslations("common")
    const pathname = usePathname()

    return (
        <header className="w-full mx-auto bg-bg/99 sticky top-0 border-b z-10 left-0">
            <div
                className={cn(
                    "px-5 mx-auto w-full flex items-center justify-between h-nav-h",
                    className,
                )}
            >
                <div className="text-sm flex items-center space-x-4 font-light">
                    <Link href="/">
                        <Brand />
                    </Link>

                    <span className="h-5 w-px bg-accent-4"></span>

                    {!isMobile && <ThemeSwitcher />}

                    {!isMobile && (
                        <nav className="flex items-center gap-x-4">
                            <Link
                                href="/docs"
                                className={cn("hover:underline", {
                                    "pointer-events-none font-regular": pathname.includes("/docs"),
                                })}
                            >
                                {tCommon("read-the-docs")}
                            </Link>

                            <Link
                                href={REPO_URL}
                                target="_blank"
                                className="hover:underline flex items-center"
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
                    <GlobalSearch
                        triggerSlot={({ onClick }) => (
                            <>
                                {!isMobile && (
                                    <Button
                                        type="button"
                                        aria-label={tCommon("search")}
                                        onClick={onClick}
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

                                {isMobile && (
                                    <Button onClick={onClick} size="icon" variant="tertiary">
                                        <Search className="size-5" />
                                    </Button>
                                )}
                            </>
                        )}
                    />

                    <ThemeToggle key="theme" />

                    {isCustomerPending && <Skeleton className="size-9 rounded-lg" />}

                    {!isCustomerPending && customer && <AuthAccountDropdown />}

                    {!isCustomerPending && !customer && <AuthGuestDropdown />}
                </div>
            </div>
        </header>
    )
}
