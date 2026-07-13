import { create } from "zustand"

export type Theme = 1 | 2 | 3

type GlobalStore = {
    sheetSidebarOpen: boolean
    theme: Theme

    toggleSheetSidebar: () => void
    setAppTheme: (theme: Theme) => void
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
    sheetSidebarOpen: false,
    theme: 1,

    toggleSheetSidebar: () => {
        set((s) => ({ sheetSidebarOpen: !s.sheetSidebarOpen }))
    },
    setAppTheme: (theme) => {
        set({ theme })
    },
}))
