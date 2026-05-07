type ValueProps = {
    children: React.ReactNode
}

export default function Value({ children }: ValueProps) {
    return (
        <div className="font-mono font-medium py-0.5 text-center rounded-md text-xs">
            {children}
        </div>
    )
}
