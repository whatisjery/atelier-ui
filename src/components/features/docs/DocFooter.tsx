import { SiGithub } from "react-icons/si"
import ThemeToggle from "@/components/common/ThemeToggle"
import Button from "@/components/ui/Button"
import { BUY_ME_A_COFFEE_URL, REPO_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

const LINKS = [
    { label: "Star on github", href: REPO_URL },
    { label: "Buy me a coffee", href: BUY_ME_A_COFFEE_URL },
    { label: "llms.txt", href: "/llms.txt" },
]

type DocFooterProps = {
    className?: string
}
export default function DocFooter({ className }: DocFooterProps) {
    return (
        <div
            className={cn(
                "text-base w-full flex h-full max-sm:pb-5 sm:items-center flex-1 items-end justify-between",
                className,
            )}
        >
            <nav className="flex items-start gap-x-4 sm:items-center sm:flex-row flex-col">
                {LINKS.map(({ label, href }) => (
                    <a
                        key={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex underline hover:no-underline items-center gap-x-1"
                        href={href}
                    >
                        {label}
                    </a>
                ))}
            </nav>

            <div className="flex items-center gap-x-1">
                <ThemeToggle key="theme" />

                <Button variant="tertiary" size="icon" asChild>
                    <a
                        aria-label="Github repository"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={REPO_URL}
                    >
                        <SiGithub className="size-4" />
                    </a>
                </Button>
            </div>
        </div>
    )
}
