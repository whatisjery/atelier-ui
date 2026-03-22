import { lazy } from "react"

export const demos: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "fluid-distortion-demo": lazy(() => import("./fluid-distortion-demo/fluid-distortion-demo")),
    "pixel-trail-demo": lazy(() => import("./pixel-trail-demo/pixel-trail-demo")),
    "magnetic-dot-grid-demo": lazy(() => import("./magnetic-dot-grid-demo/magnetic-dot-grid-demo")),
}
