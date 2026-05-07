"use client"
import AnimatedArrow from "@/components/ui/AnimatedArrow"
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"
import { useRouter } from "@/i18n/navigation"
import type { DocNavigation } from "@/types/docs"

export default function DocHeaderNavButtons({ navigation }: { navigation: DocNavigation }) {
    const router = useRouter()

    return (
        <>
            {navigation.prev !== null && (
                <Tooltip side="top" title={navigation.prev.title}>
                    <Button
                        aria-label={navigation.prev.title}
                        onClick={() => {
                            if (navigation.prev) router.push(navigation.prev.url)
                        }}
                        variant="primary"
                        size="icon"
                    >
                        <AnimatedArrow className="size-3.5" direction="left" />
                    </Button>
                </Tooltip>
            )}

            {navigation.next !== null && (
                <Tooltip side="top" title={navigation.next.title}>
                    <Button
                        aria-label={navigation.next.title}
                        onClick={() => {
                            if (navigation.next) router.push(navigation.next.url)
                        }}
                        variant="primary"
                        size="icon"
                    >
                        <AnimatedArrow className="size-3.5" direction="right" />
                    </Button>
                </Tooltip>
            )}
        </>
    )
}
