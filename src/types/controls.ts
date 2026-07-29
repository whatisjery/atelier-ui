type ControlBase = {
    showIf?: string
}

export type ControlSlider = ControlBase & {
    type: "slider"
    value: number
    min: number
    max: number
    step: number
}

export type ControlColor = ControlBase & {
    type: "color"
    value: string
}

export type ControlPalette = ControlBase & {
    type: "palette"
    value: string[]
    min: number
    max: number
}

export type ControlBoolean = ControlBase & {
    type: "boolean"
    value: boolean
}

export type ControlSelect = ControlBase & {
    type: "select"
    value: string
    options: string[]
}

export type ControlValue = number | string | boolean | string[]

export type ControlDef =
    | ControlSlider
    | ControlColor
    | ControlPalette
    | ControlBoolean
    | ControlSelect
