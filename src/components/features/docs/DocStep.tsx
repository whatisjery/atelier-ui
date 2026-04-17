"use client"

type DocStepProps = {
    title: string
    children: React.ReactNode
    step: number
}

export default function DocStep({ children, step, title }: DocStepProps) {
    return (
        <section className="flex gap-x-3.5 mt-8">
            <div className="text-background bg-mat-1 size-5 flex items-center justify-center rounded-md font-medium shrink-0">
                {step}
            </div>

            <div className="w-full min-w-0">
                <h3 className="text-mat-1 -mt-1.5" id={title.toLowerCase().replace(/\s+/g, "-")}>
                    {title}
                </h3>
                {children}
            </div>
        </section>
    )
}
