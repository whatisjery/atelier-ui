import { useRef } from "react"

export function useDropdownFocus() {
    const keyboard = useRef(false)
    return {
        onEscapeKeyDown: () => {
            keyboard.current = true
        },

        onCloseAutoFocus: (e: Event) => {
            if (!keyboard.current) e.preventDefault()
            keyboard.current = false
        },
    }
}
