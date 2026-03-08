"use client"

type DocStepProps = {
    title: string
    children: React.ReactNode
    step: number
}

export default function DocStep({ children, step, title }: DocStepProps) {
    return (
        <section
            className="relative flex flex-col first-of-type:-mt-6
        before:content-[''] before:absolute before:-left-7.25 before:top-[calc(4.2rem)]
        before:border-l lg:before:border-border lg:before:h-[calc(100%-2.2rem)] last:before:h-[calc(100%-2.3rem)]"
        >
            <header className="relative max-lg:gap-x-2 -mb-3 max-lg:items-center max-lg:flex-row-reverse max-lg:flex max-lg:justify-end">
                <h3 className="text-mat-1" id={title.toLowerCase().replace(/\s+/g, "-")}>
                    {title}
                </h3>

                <span className="lg:absolute lg:-left-10 lg:top-[0.15rem] lg:mt-8.5 mt-4.5 flex h-6 w-6 items-center justify-center rounded-md bg-highlight/5 text-xs border border-highlight/30 font-medium text-highlight">
                    {step}
                </span>
            </header>

            <div className="[&>*:last-child]:mb-0">{children}</div>
        </section>
    )
}
