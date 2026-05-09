import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { parseArgs } from "node:util"

type Template = (vars: { name: string; Pascal: string; Title: string }) => string

const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
        category: { type: "string", short: "c" },
    },
    allowPositionals: true,
})

const name = positionals[0]
const category = values.category

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error("Usage: pnpm scafold-new <kebab-case-name> --category <category>")
    console.error("e.g. pnpm scafold-new infinite-gallery --category scroll")
    process.exit(1)
}

const root = execSync("git rev-parse --show-toplevel").toString().trim()
const contentRoot = join(root, "src/content/en/components")

const existingCategories = readdirSync(contentRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

if (!category) {
    console.error("Missing --category. Existing categories:")
    for (const c of existingCategories) console.error(`  - ${c}`)
    console.error(`\nUsage: pnpm new ${name} --category <category>`)
    process.exit(1)
}

if (!/^[a-z][a-z0-9-]*$/.test(category)) {
    console.error(`✘ invalid category "${category}" (must be kebab-case)`)
    process.exit(1)
}

if (!existingCategories.includes(category)) {
    console.error(`✘ category "${category}" doesn't exist. Existing categories:`)
    for (const c of existingCategories) console.error(`  - ${c}`)
    console.error(`\nCreate the folder first if you really want a new one:`)
    console.error(`  mkdir src/content/en/components/${category}`)
    process.exit(1)
}

const Pascal = name
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("")

const Title = name
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ")

const baseTemplate: Template = ({ name, Pascal }) => `\
export function ${Pascal}() {
    return <div>${name.replace(/-/g, " ")}</div>
}
`

const demoTemplate: Template = ({ name, Pascal }) => `\
import { ${Pascal} } from "@/registry/base/${name}/${name}"

export default function ${Pascal}Demo() {
    return (
        <div>
            <${Pascal} />
        </div>
    )
}
`

const mdxTemplate: Template = ({ name, Title }) => `\
---
title: "${Title}"
description: "lorem ipsum"
tags: []
---

<DemoPreview name="${name}" />

## CLI Install

<InstalGuideCLI name="${name}" />

---

## Manual Install

<InstalGuideManual name="${name}" />

---

## API

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
|      |      |         |             |
`

const vars = { name, Pascal, Title }

const files: Record<string, string> = {
    [`src/registry/base/${name}/${name}.tsx`]: baseTemplate(vars),
    [`src/registry/demos/${name}/${name}.tsx`]: demoTemplate(vars),
    [`src/content/en/components/${category}/${name}.mdx`]: mdxTemplate(vars),
}

for (const [rel, contents] of Object.entries(files)) {
    const full = join(root, rel)
    if (existsSync(full)) {
        console.error(`✘ ${rel} exists`)
        process.exit(1)
    }
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, contents)
    console.log(`✓ ${rel}`)
}

const demosPath = join(root, "src/registry/demos/index.ts")
const demosSrc = readFileSync(demosPath, "utf8")
const demosEntry = `    "${name}": lazy(() => import("./${name}/${name}")),\n`

const demosPatched = demosSrc.replace(/\n\}\s*$/, `\n${demosEntry}}\n`)

if (demosPatched === demosSrc) {
    console.error(`✘ could not patch ${demosPath} — expected a trailing '}' on its own line`)
    process.exit(1)
}

writeFileSync(demosPath, demosPatched)
console.log(`✓ patched src/registry/demos/index.ts`)

const regPath = join(root, "src/registry/index.ts")
const regSrc = readFileSync(regPath, "utf8")
const regEntry = `    {
        name: "${name}",
        files: ["${name}.tsx"],
        description: "TODO",
        shared: [],
        dependencies: [],
        registryDependencies: [],
    },\n`

const regPatched = regSrc.replace(/\n\]\s*$/, `\n${regEntry}]\n`)

if (regPatched === regSrc) {
    console.error(`✘ could not patch ${regPath} — expected a trailing ']' on its own line`)
    process.exit(1)
}

writeFileSync(regPath, regPatched)
console.log(`✓ patched src/registry/index.ts`)
console.log(`\n→ open src/registry/base/${name}/${name}.tsx and start coding`)

execSync("pnpm lint:fix", { stdio: "inherit" })
console.log("✓ lint:fix")
