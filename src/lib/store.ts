import { create } from "zustand"
import type { PolarCustomer } from "@/types/polar"

export type Theme = 1 | 2 | 3

type GlobalStore = {
    sheetSidebarOpen: boolean
    customer: PolarCustomer | null
    isCustomerPending: boolean
    theme: Theme

    toggleSheetSidebar: () => void
    setCustomer: (customer: PolarCustomer | null) => void
    setAppTheme: (theme: Theme) => void
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
    sheetSidebarOpen: false,
    customer: null,
    isCustomerPending: true,
    theme: 1,

    setCustomer: (customer: PolarCustomer | null) => {
        set({ customer, isCustomerPending: false })
    },
    toggleSheetSidebar: () => {
        set((s) => ({ sheetSidebarOpen: !s.sheetSidebarOpen }))
    },
    setAppTheme: (theme) => {
        set({ theme })
    },
}))
