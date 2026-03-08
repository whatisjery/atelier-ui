import { lazy } from "react"

export const demos: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "fluid-cursor-demo": lazy(() => import("./fluid-cursor-demo/fluid-cursor-demo")),
}
