export type ControlSlider = {
    type: "slider"
    value: number
    min: number
    max: number
    step: number
}

export type ControlColor = {
    type: "color"
    value: string
}

export type ControlBoolean = {
    type: "boolean"
    value: boolean
}

export type ControlSelect = {
    type: "select"
    value: string
    options: string[]
}

export type ControlValue = number | string | boolean

export type ControlDef = ControlSlider | ControlColor | ControlBoolean | ControlSelect
