"use client"

type IconLogoProps = Omit<React.SVGProps<SVGSVGElement>, "width" | "height"> & {
    size?: number
}

export default function Logo({ size = 36, ...props }: IconLogoProps) {
    return (
        <svg
            role="img"
            aria-label="Atelier UI Logo"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M13.923 44.1515H0.5V30.7613L20.6504 3.84766H34.0688V20.2807H47.5V44.1515H27.3673V24.0115L13.923 44.1515Z"
                fill="light-dark(black, white)"
            />
        </svg>
    )
}
