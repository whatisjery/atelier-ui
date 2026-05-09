import type { MDXComponents } from "mdx/types"
import CodeBlock from "@/components/features/docs/code-block/CodeBlock"
import { Link } from "@/i18n/navigation"
import { slugify } from "@/lib/utils"

const components: MDXComponents = {
    table: ({ children }) => {
        return (
            <div className="w-full overflow-x-auto text-sm">
                <table className="not-prose w-full min-w-[600px] overflow-hidden border-separate border-spacing-0 border rounded-lg bg-bg">
                    {children}
                </table>
            </div>
        )
    },

    th: ({ children }) => (
        <th className="px-3 py-3 text-sm bg-accent-5 text-left font-medium border-b last:border-r-0">
            {children}
        </th>
    ),

    td: ({ children }) => (
        <td className="px-3 py-2 border-b last:border-r-0 [tr:last-child_&]:border-b-0 border-dashed">
            {children}
        </td>
    ),

    em: ({ children }) => <em className="font-light text-accent-2">{children}</em>,

    a: ({ children, href }) => (
        <Link className="font-medium underline hover:no-underline" target="_blank" href={href}>
            {children}
        </Link>
    ),

    hr: () => <hr className="border-theme-border" />,

    ul: ({ children }) => {
        return <ul className="pl-2">{children}</ul>
    },

    ol: ({ children }) => {
        return <ol className="pl-2">{children}</ol>
    },

    li: ({ children }) => {
        return (
            <li className="list-disc list-outside ml-2 pl-1 marker:text-accent-1 marker:font-light">
                {children}
            </li>
        )
    },

    h2: ({ children }) => {
        const id = slugify(children?.toString())
        return (
            <h2 id={id} className="scroll-mt-sticky-nested text-2xl font-semibold">
                {children}
            </h2>
        )
    },
    h3: ({ children }) => {
        const id = slugify(children?.toString())
        return (
            <h3 id={id} className="scroll-mt-sticky-nested text-xl font-semibold">
                {children}
            </h3>
        )
    },
    h4: ({ children }) => {
        const id = slugify(children?.toString())
        return (
            <h4 id={id} className="scroll-mt-sticky-nested">
                {children}
            </h4>
        )
    },
    h5: ({ children }) => {
        const id = slugify(children?.toString())
        return (
            <h5 id={id} className="scroll-mt-sticky-nested">
                {children}
            </h5>
        )
    },

    code: ({ children }) => {
        return (
            <code className="inline-block text-sm not-prose bg-accent-5 border rounded-md px-1.25 py-0.5 font-mono">
                {children}
            </code>
        )
    },

    pre: async ({ children, title, mode = "scroll", showLineNumbers }) => {
        const codeElement = children as React.ReactElement<{
            children: string
            className?: string
        }>

        const code = codeElement?.props?.children?.trimEnd() ?? ""
        const className = codeElement?.props?.className ?? ""
        const lang = className.replace("language-", "") || "text"

        return (
            <CodeBlock
                mode={mode}
                code={code}
                lang={lang}
                title={title}
                showLineNumbers={showLineNumbers}
            />
        )
    },
}

export function useMDXComponents(): MDXComponents {
    return components
}
