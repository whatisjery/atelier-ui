"use client"

type IconMotionIconProps = {
    size?: number
    className?: string
}

export function IconMotionIcon({ size = 48, className }: IconMotionIconProps) {
    return (
        <svg
            role="img"
            aria-label="Motion Icon"
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M18.2644 15.6836L8.96847 32.3158H0.5L7.7577 19.3294C8.88406 17.315 11.6917 15.6836 14.0302 15.6836H18.2644ZM39.0315 19.8413C39.0315 17.5453 40.9273 15.6836 43.2658 15.6836C45.6043 15.6836 47.5 17.5453 47.5 19.8413C47.5 22.1386 45.6043 24.0004 43.2658 24.0004C40.9273 24.0004 39.0315 22.1386 39.0315 19.8413ZM19.8516 15.6836H28.32L19.0241 32.3158H10.5556L19.8516 15.6836ZM29.8546 15.6836H38.3231L31.064 28.6714C29.939 30.6843 27.1314 32.3158 24.7929 32.3158H20.5586L29.8546 15.6836Z"
                fill="currentColor"
            />
        </svg>
    )
}
