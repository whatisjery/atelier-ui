import PageDocLayout from "@/components/features/docs/_PageDocLayout"
import Skeleton from "@/components/ui/Skeleton"

export default function DocLoadingBlock() {
    return (
        <PageDocLayout
            topBarSlot={<Skeleton className="max-sm:hidden w-60 h-10" />}
            contentSlot={
                <div className="gap-4 flex flex-col ">
                    <Skeleton className="w-full h-15" />
                    <Skeleton className="w-full h-100" />
                    <Skeleton className="w-full h-100" />
                </div>
            }
        />
    )
}
