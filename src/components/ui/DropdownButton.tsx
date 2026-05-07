import { ArrowDown } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"

type SwitchButtonProps = {
    children: ReactNode
    variant: "primary" | "secondary"
} & ComponentProps<typeof Button>

export default function DropdownButton({ children, variant, ...props }: SwitchButtonProps) {
    const cls =
        "flex items-center justify-center w-full h-full absolute transition-(transform,opacity) duration-200 ease-expo-out"

    return (
        <Button variant={variant} size="icon" className="relative group overflow-hidden" {...props}>
            <span
                className={cn(
                    "top-0 left-0 opacity-100 group-data-[state=open]:-translate-y-[20%] group-data-[state=open]:opacity-0",
                    cls,
                )}
            >
                {children}
            </span>

            <span
                className={cn(
                    "group-data-[state=open]:opacity-100 group-data-[state=open]:translate-y-[0%] translate-y-[25%] opacity-0",
                    cls,
                )}
            >
                <ArrowDown className="size-3.5 text-inherit" />
            </span>
        </Button>
    )
}
