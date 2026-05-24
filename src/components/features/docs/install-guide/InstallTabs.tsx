"use client"

import { Tabs } from "radix-ui"
import { useState } from "react"
import Button from "@/components/ui/Button"

type InstallTabsProps = {
    cliSlot: React.ReactNode
    manualSlot: React.ReactNode
}

export default function InstallTabs({ cliSlot, manualSlot }: InstallTabsProps) {
    const [value, setValue] = useState("cli")

    return (
        <Tabs.Root value={value} onValueChange={setValue}>
            <Tabs.List className="flex items-center mb-4">
                <Tabs.Trigger value="cli" asChild>
                    <Button variant={value === "cli" ? "secondary" : "ghost"} size="tag">
                        CLI
                    </Button>
                </Tabs.Trigger>
                <Tabs.Trigger value="manual" asChild>
                    <Button variant={value === "manual" ? "secondary" : "ghost"} size="tag">
                        Manual
                    </Button>
                </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="cli" forceMount className="data-[state=inactive]:hidden">
                {cliSlot}
            </Tabs.Content>

            <Tabs.Content value="manual" forceMount className="data-[state=inactive]:hidden">
                {manualSlot}
            </Tabs.Content>
        </Tabs.Root>
    )
}
