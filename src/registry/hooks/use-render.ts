// biome-ignore-all lint/suspicious/noExplicitAny: prop merging is inherently dynamic
/**
 * Inspired by Base UI's `useRender` + `mergeProps`, intentionally simplified for this
 * library's scope at the moment.
 *
 * Chosen over polymorphic prop: cleaner TypeScript, integrates better with other
 * component (Next/Image, design systems, third-party UI libraries)
 *
 * @see https://base-ui.com/react/utils/use-render
 * @see https://base-ui.com/react/utils/merge-props
 */
import { cloneElement, isValidElement, type ReactElement, type Ref } from "react"

type AnyProps = Record<string, any>

type RenderFunction<S> = (props: AnyProps, state: S) => ReactElement

export type RenderProp<S = void> = ReactElement | RenderFunction<S>

type UseRenderOptions<S> = {
    render: RenderProp<S> | undefined
    props: AnyProps
    state?: S
    defaultElement: ReactElement
}

export function useRender<S = void>(options: UseRenderOptions<S>): ReactElement<AnyProps> {
    const { render, props, state, defaultElement } = options
    const target = render ?? defaultElement

    // Function form: consumer wires props themselves, no merging needed.
    if (typeof target === "function") {
        return target(props, state as S) as ReactElement<AnyProps>
    }

    // Element form: clone and merge our internal props with whatever the consumer set on the element.
    const targetProps = (isValidElement(target) ? target.props : {}) as AnyProps
    return cloneElement(target, mergeProps(props, targetProps)) as ReactElement<AnyProps>
}

function mergeProps(internal: AnyProps, external: AnyProps): AnyProps {
    const merged: AnyProps = { ...internal }

    for (const key in external) {
        const internalValue = internal[key]
        const externalValue = external[key]

        if (key === "className" && typeof externalValue === "string") {
            merged[key] = [internalValue, externalValue].filter(Boolean).join(" ")
        } else if (key === "style" && externalValue && typeof externalValue === "object") {
            merged[key] = { ...internalValue, ...externalValue }
        } else if (key === "ref") {
            merged[key] = composeRefs(internalValue, externalValue)
        } else if (
            key.startsWith("on") &&
            typeof internalValue === "function" &&
            typeof externalValue === "function"
        ) {
            // External handler runs first so consumers can stopPropagation before our logic fires.
            merged[key] = chainFunctions(externalValue, internalValue)
        } else {
            merged[key] = externalValue
        }
    }

    return merged
}

function chainFunctions(...fns: Array<(...args: any[]) => void>) {
    return (...args: any[]) => {
        for (const fn of fns) fn(...args)
    }
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
    return (node: T) => {
        for (const ref of refs) {
            if (typeof ref === "function") ref(node)
            else if (ref != null) (ref as { current: T | null }).current = node
        }
    }
}
