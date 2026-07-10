import { components } from "@/registry"

type TRegistryComponent = (typeof components)[number]

/**
 * Resolves the deep dependencies of a component. Entries in index.ts only
 * list what they use directly, so this walks the chain to get everything
 * a component needs: components, npm packages, and shared files.
 */
export function resolveTransitiveDependencies(name: string) {
    const component = findComponent(name)
    const found = new Map<string, TRegistryComponent>()

    const queue = [...component.registryDependencies]
    while (queue.length > 0) {
        const depName = queue.shift() as string
        if (!found.has(depName)) {
            const dep = findComponent(depName)
            found.set(depName, dep)
            queue.push(...dep.registryDependencies)
        }
    }
    found.delete(name)

    const all = [component, ...found.values()]

    return {
        ...component,
        dependencies: unique(all.flatMap((c) => c.dependencies)),
        registryDependencies: [...found.keys()],
        shared: unique(all.flatMap((c) => c.shared)),
    }
}

function findComponent(name: string): TRegistryComponent {
    const component = components.find((c) => c.name === name)
    if (!component) throw new Error(`Unknown registry component "${name}"`)
    return component
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)]
}
