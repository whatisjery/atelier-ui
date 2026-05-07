"use client"

import { PanelLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useGlobalStore } from "@/lib/store"
import Button from "../ui/Button"

export default function ButtonSideBar() {
    const sideBarOpen = useGlobalStore((state) => state.sideBarOpen)
    const isMobile = useIsMobile(1024)
    const toggleSidebar = useGlobalStore((state) => state.toggleSidebar)
    const toggleSheetSidebar = useGlobalStore((state) => state.toggleSheetSidebar)

    const openSidebar = () => {
        if (isMobile) toggleSheetSidebar()
        else toggleSidebar()
    }

    if (!isMobile && sideBarOpen) return null

    return (
        <Button size="icon" variant="tertiary" className="xs:mr-5" onClick={openSidebar}>
            <PanelLeft strokeWidth={1.5} className="size-5" />
        </Button>
    )
}
