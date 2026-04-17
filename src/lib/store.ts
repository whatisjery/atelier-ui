import { create } from "zustand"
import type { PolarCustomer } from "@/types/polar"

type GlobalStore = {
    isSidebarOpen: boolean
    customer: PolarCustomer | null
    isCustomerPending: boolean

    toggleSidebar: () => void
    setCustomer: (customer: PolarCustomer | null) => void
}

export const useGlobalStore = create<GlobalStore>((set) => ({
    isSidebarOpen: false,
    customer: null,
    isCustomerPending: true,

    setCustomer: (customer: PolarCustomer | null) => {
        set({ customer, isCustomerPending: false })
    },

    toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
    },
}))
