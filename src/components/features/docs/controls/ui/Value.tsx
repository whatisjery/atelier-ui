type ValueProps = {
    children: React.ReactNode
}

export default function Value({ children }: ValueProps) {
    return (
        <div className="font-mono min-h-control-h font-light flex items-center justify-center rounded-sm text-xs bg-accent-5">
            {children}
        </div>
    )
}
