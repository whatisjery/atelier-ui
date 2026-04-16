import type { MDXComponents } from "mdx/types"
import { DocCodeBlock } from "@/components/features/docs/DocCodeBlock"
import { Link } from "@/i18n/navigation"

const components: MDXComponents = {
    table: ({ children }) => {
        return (
            <div className="w-full overflow-x-auto text-sm">
                <table className="not-prose w-full min-w-[600px] overflow-hidden border-separate border-spacing-0 border rounded-lg bg-background">
                    {children}
                </table>
            </div>
        )
    },

    th: ({ children }) => (
        <th className="px-3 py-2 text-sm bg-mat-5 text-left font-medium border-b last:border-r-0">
            {children}
        </th>
    ),

    td: ({ children }) => (
        <td className="px-3 py-2 border-b last:border-r-0 [tr:last-child_&]:border-b-0">
            {children}
        </td>
    ),

    em: ({ children }) => <em className="font-light text-mat-2">{children}</em>,

    a: ({ children, href }) => (
        <Link
            className="font-regular text-highlight hover:no-underline"
            target="_blank"
            href={href}
        >
            {children}
        </Link>
    ),

    hr: () => <hr className="border-border" />,

    ul: ({ children }) => {
        return <ul className="pl-2">{children}</ul>
    },

    ol: ({ children }) => {
        return <ol className="pl-2">{children}</ol>
    },

    li: ({ children }) => {
        return (
            <li className="list-disc list-outside ml-5 pl-1 marker:text-mat-2/40 marker:font-light">
                {children}
            </li>
        )
    },

    h2: ({ children }) => {
        const id = children?.toString().toLowerCase().replace(/\s+/g, "-")
        return (
            <h2 id={id} className="scroll-mt-offset text-2xl font-semibold">
                {children}
            </h2>
        )
    },
    h3: ({ children }) => {
        const id = children?.toString().toLowerCase().replace(/\s+/g, "-")
        return (
            <h3 id={id} className="scroll-mt-offset text-xl font-semibold">
                {children}
            </h3>
        )
    },
    h4: ({ children }) => {
        const id = children?.toString().toLowerCase().replace(/\s+/g, "-")
        return (
            <h4 id={id} className="scroll-mt-offset">
                {children}
            </h4>
        )
    },
    h5: ({ children }) => {
        const id = children?.toString().toLowerCase().replace(/\s+/g, "-")
        return (
            <h5 id={id} className="scroll-mt-offset">
                {children}
            </h5>
        )
    },

    code: ({ children }) => {
        return (
            <code className="inline-block text-sm not-prose bg-mat-5 dark:bg-mat-3/50 border border-mat-3/80 dark:border-mat-2/20 cursor-default rounded-md px-1.25 py-0.5">
                {children}
            </code>
        )
    },

    pre: async ({ children, title, mode = "scroll" }) => {
        const codeElement = children as React.ReactElement<{
            children: string
            className?: string
        }>

        const code = codeElement?.props?.children?.trimEnd() ?? ""
        const className = codeElement?.props?.className ?? ""
        const lang = className.replace("language-", "") || "text"

        return <DocCodeBlock mode={mode} code={code} lang={lang} title={title} />
    },
}

export function useMDXComponents(): MDXComponents {
    return components
}
