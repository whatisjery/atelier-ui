"use client"

import { Tabs } from "radix-ui"
import { useState } from "react"
import Button from "@/components/ui/Button"

type InstallTabsProps = {
    cliSlot: React.ReactNode
    manualSlot: React.ReactNode
    promptSlot?: React.ReactNode
    agentSlot?: React.ReactNode
}

export default function InstallTabs({
    cliSlot,
    manualSlot,
    promptSlot,
    agentSlot,
}: InstallTabsProps) {
    const [value, setValue] = useState(agentSlot ? "agent" : "cli")

    return (
        <Tabs.Root value={value} onValueChange={setValue}>
            <Tabs.List className="flex items-center mb-4">
                {agentSlot && (
                    <Tabs.Trigger value="agent" asChild>
                        <Button variant={value === "agent" ? "secondary" : "ghost"} size="tag">
                            Agent
                        </Button>
                    </Tabs.Trigger>
                )}
                <Tabs.Trigger value="cli" asChild>
                    <Button variant={value === "cli" ? "secondary" : "ghost"} size="tag">
                        CLI
                    </Button>
                </Tabs.Trigger>
                {promptSlot && (
                    <Tabs.Trigger value="prompt" asChild>
                        <Button variant={value === "prompt" ? "secondary" : "ghost"} size="tag">
                            Prompt
                        </Button>
                    </Tabs.Trigger>
                )}
                <Tabs.Trigger value="manual" asChild>
                    <Button variant={value === "manual" ? "secondary" : "ghost"} size="tag">
                        Manual
                    </Button>
                </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="cli" forceMount className="data-[state=inactive]:hidden">
                {cliSlot}
            </Tabs.Content>

            {agentSlot && (
                <Tabs.Content value="agent" forceMount className="data-[state=inactive]:hidden">
                    {agentSlot}
                </Tabs.Content>
            )}

            <Tabs.Content value="manual" forceMount className="data-[state=inactive]:hidden">
                {manualSlot}
            </Tabs.Content>

            {promptSlot && (
                <Tabs.Content value="prompt" forceMount className="data-[state=inactive]:hidden">
                    {promptSlot}
                </Tabs.Content>
            )}
        </Tabs.Root>
    )
}
