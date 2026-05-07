import Badge from "@/components/ui/Badge"

type LabelProps = {
    children: React.ReactNode
}

export default function Label({ children }: LabelProps) {
    return <Badge variant="neutral" title={children?.toString() ?? ""} />
}
