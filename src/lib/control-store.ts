import { create } from "zustand"
import type { ControlValue } from "@/types/controls"

type ControlStore = {
    name: string | null
    values: Record<string, ControlValue>

    setValue: (name: string, key: string, value: ControlValue) => void
    reset: (name: string) => void
}

const EMPTY: Record<string, ControlValue> = {}

export const useControlStore = create<ControlStore>()((set) => ({
    name: null,
    values: EMPTY,

    setValue: (name: string, key: string, value: ControlValue) => {
        set((state) => ({
            name,
            values: state.name === name ? { ...state.values, [key]: value } : { [key]: value },
        }))
    },

    reset: (name: string) => {
        set({ name, values: EMPTY })
    },
}))

export function useControlValues(name: string): Record<string, ControlValue> {
    return useControlStore((state) => (state.name === name ? state.values : EMPTY))
}
