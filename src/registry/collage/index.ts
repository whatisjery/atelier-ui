import { lazy } from "react"

export const collages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "composition-1": lazy(() => import("./composition-1/composition-1")),
}
