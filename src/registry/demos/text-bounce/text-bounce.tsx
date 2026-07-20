import { TextBounce, type TextBounceProps } from "@/registry/base/text-bounce/text-bounce"

export default function TextBounceDemo(controls: Partial<TextBounceProps>) {
    return (
        <div className="w-screen h-screen max-w-[47rem] px-5 flex items-center justify-center cursor-default">
            <div>
                <TextBounce
                    render={<p className="text-4xl font-medium tracking-tight" />}
                    {...controls}
                >
                    The eye can travel over the surface in a way parallel to the way it moves over
                    nature. It should feel caressed and soothed, experience frictions and ruptures,
                    glide and drift.
                </TextBounce>
            </div>
        </div>
    )
}
