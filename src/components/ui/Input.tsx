import { cn } from "@/lib/utils"

type InputProps = {
    className?: string
    ref?: React.Ref<HTMLInputElement>
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ref, ...props }: InputProps) {
    return (
        <input
            ref={ref}
            className={cn(
                "focus-visible:border focus-visible:ring-6 focus-visible:ring-accent-4 border rounded-sm bg-transparent outline-none text-sm h-11 px-3 [&::-webkit-search-cancel-button]:hidden",
                className,
            )}
            {...props}
        />
    )
}
