import { lazy } from "react"

export const collages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "fluid-scene": lazy(() => import("./fluid-scene/fluid-scene")),
}
