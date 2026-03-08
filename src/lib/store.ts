import { create } from "zustand"

type SidebarStore = {
    isSidebarOpen: boolean
    toggleSidebar: () => void
}

export const useGlobalStore = create<SidebarStore>((set) => ({
    isSidebarOpen: false,

    toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
    },
}))
