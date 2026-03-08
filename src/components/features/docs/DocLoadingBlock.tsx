import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import Skeleton from "@/components/ui/Skeleton"

export default function DocLoadingBlock() {
    return (
        <PageDocLayout
            headerSlot={
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-30 h-5" />
                    <Skeleton className="w-full h-15" />
                    <Skeleton className="w-full h-10" />
                </div>
            }
            contentSlot={
                <div className="gap-5 flex flex-col ">
                    <Skeleton className="w-full h-50" />
                    <Skeleton className="w-full h-100" />
                    <Skeleton className="w-full h-100" />
                </div>
            }
            TOCSlot={
                <div className="flex flex-col gap-2">
                    <Skeleton className="w-30 h-5" />
                    <Skeleton className="w-full h-50" />
                </div>
            }
        />
    )
}
