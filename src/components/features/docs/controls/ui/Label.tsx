type LabelProps = {
    children: React.ReactNode
}

export default function Label({ children }: LabelProps) {
    return <div className="text-xs uppercase font-mono text-mat-2">{children}</div>
}
