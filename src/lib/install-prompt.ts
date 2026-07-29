export function installPrompt(name: string, title: string, props?: string): string {
    const lines = [
        `Add Atelier's ${title} to my app.`,
        `Run: npx shadcn@latest add @atelier/${name}`,
        "That writes the atelier-ui skill under .agents/skills and .claude/skills. Follow it.",
    ]

    if (props) lines.push("", `Props: ${props}`)

    return lines.join("\n")
}
