"use client"

import type { ControlDef, ControlValue } from "@/types/controls"
import ColorControl from "./ColorControl"
import SelectControl from "./SelectControl"
import SliderControl from "./SliderControl"
import SwitchControl from "./SwitchControl"

type ControlFieldProps = {
    control: ControlDef
    label: string
    value: ControlValue
    onChange: (value: ControlValue) => void
}

export default function ControlField({ label, control, value, onChange }: ControlFieldProps) {
    return (
        <>
            {control.type === "slider" && (
                <SliderControl
                    label={label}
                    control={control}
                    value={value as number}
                    onChange={onChange}
                />
            )}

            {control.type === "select" && (
                <SelectControl
                    label={label}
                    control={control}
                    value={value as string}
                    onChange={onChange}
                />
            )}

            {control.type === "color" && (
                <ColorControl
                    label={label}
                    control={control}
                    value={value as string}
                    onChange={onChange}
                />
            )}

            {control.type === "boolean" && (
                <SwitchControl
                    label={label}
                    control={control}
                    value={value as boolean}
                    onChange={onChange}
                />
            )}
        </>
    )
}
