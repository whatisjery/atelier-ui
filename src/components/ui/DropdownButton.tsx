import { ArrowDown } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"

type SwitchButtonProps = {
    children: ReactNode
    variant: "primary" | "secondary"
} & ComponentProps<typeof Button>

export default function DropdownButton({ children, variant, ...props }: SwitchButtonProps) {
    return (
        <Button
            variant={variant}
            size="icon"
            className="rounded-lg relative overflow-hidden group data-[state=open]:pointer-events-none"
            {...props}
        >
            <div className="transition-transform duration-300 group-data-[state=open]:opacity-0 ease-expo-out translate-y-[0%] group-data-[state=open]:translate-y-[-40%] w-full h-full bg-transparent flex items-center justify-center rounded-md absolute inset-0">
                <span className="user-select-none group-hover:opacity-50 transition-opacity duration-100">
                    {children}
                </span>
            </div>

            <div
                className={cn(
                    "user-select-none transition-transform duration-300 ease-expo-out translate-y-full group-data-[state=open]:translate-y-0 w-full h-full bg-background border border-transparent flex items-center justify-center rounded-md absolute inset-0",
                    {
                        "border-border": variant === "secondary",
                    },
                )}
            >
                <ArrowDown className="size-3.5 text-mat-1" />
            </div>
        </Button>
    )
}
