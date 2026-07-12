import { lazy } from "react"

export const collages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    "collage-01": lazy(() => import("./collage-01/collage-01")),
}
