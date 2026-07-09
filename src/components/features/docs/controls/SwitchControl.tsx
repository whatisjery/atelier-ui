import { Switch } from "radix-ui"
import type { ControlBoolean } from "@/types/controls"
import ControlLayout from "./ui/ControlLayout"

type SwitchControlProps = {
    label: string
    value: boolean
    control: ControlBoolean
    onChange: (value: boolean) => void
}

export default function SwitchControl({ label, value, onChange }: SwitchControlProps) {
    return (
        <ControlLayout label={label}>
            <Switch.Root
                checked={value}
                onCheckedChange={onChange}
                aria-label={label}
                className="relative ml-auto h-6 w-10 cursor-pointer rounded-full transition-colors hover:ring-1 hover:ring-accent-3"
                style={{ backgroundColor: value ? "var(--theme-bg)" : "var(--accent-4)" }}
            >
                <Switch.Thumb
                    className="block size-4.5 rounded-full dark:bg-accent-1 bg-bg transition-transform"
                    style={{ transform: value ? "translateX(20px)" : "translateX(3px)" }}
                />
            </Switch.Root>
        </ControlLayout>
    )
}
