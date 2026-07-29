import DocCollapsible from "@/components/features/docs/DocCollapsible"
import { Link } from "@/i18n/navigation"
import { getDocsByName } from "@/lib/docs"
import { libraries } from "@/lib/libraries"
import { resolveTransitiveDependencies } from "@/lib/resolve-dependencies"
import { components } from "@/registry"

type BuiltOnProps = {
    name: string
    locale: string
}

type Block = {
    title: string
    description: string
    href: string
}

const linkClassName = "text-link no-underline hover:underline"

export default function BuiltOn({ name, locale }: BuiltOnProps) {
    const resolved = resolveTransitiveDependencies(name)
    const docs = getDocsByName(locale)

    const blocks = resolved.registryDependencies.reduce<Block[]>((entries, dependency) => {
        const doc = docs.get(dependency)
        const component = components.find((entry) => entry.name === dependency)
        if (doc && component) {
            entries.push({ title: doc.title, description: component.description, href: doc.url })
        }
        return entries
    }, [])

    const packages = resolved.dependencies
        .map((dependency) => libraries[dependency])
        .filter((library) => library !== undefined)

    const isSelfContained = blocks.length === 0 && packages.length === 0

    return (
        <DocCollapsible title="Built on" defaultOpen>
            {isSelfContained && (
                <p>No dependencies. This one runs on React and Tailwind CSS alone.</p>
            )}

            {packages.map((library) => (
                <p key={library.url}>
                    <a
                        className={linkClassName}
                        href={library.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {library.title}
                    </a>
                    <br />
                    {library.description}
                </p>
            ))}

            {blocks.map((block) => (
                <p key={block.href}>
                    <Link className={linkClassName} href={block.href}>
                        {block.title} (Atelier)
                    </Link>
                    <br />
                    {block.description}
                </p>
            ))}
        </DocCollapsible>
    )
}
