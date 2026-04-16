type ValueProps = {
    children: React.ReactNode
}

export default function Value({ children }: ValueProps) {
    return (
        <div className="bg-mat-5/80 font-mono py-0.5 min-w-14 text-center px-2 rounded-md border border-mat-4 text-xs">
            {children}
        </div>
    )
}
