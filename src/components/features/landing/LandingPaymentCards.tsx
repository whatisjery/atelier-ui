import { Check } from 'lucide-react'
import { IconPxRobot } from '@/components/icons/IconPxRobot'
import Button from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const DEFAULT_DASH = 4
const DEFAULT_GAP = 4

const FRAME_HANDLES = [
    'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
] as const

const PLANS = [
    {
        label: 'plan / 01',
        title: 'Community catalog.',
        price: '$0',
        highlighted: false,
        button: 'Browse the catalog',
        features: [
            '25+ animated components',
            'Production-ready, typed React code',
            'Shared WebGL canvas system',
            'CLI install, code you own',
            'MIT licensed, yours forever',
            'Community support',
        ],
    },
    {
        label: 'plan / 02',
        title: 'Get everything, forever.',
        price: '$49.99',
        highlighted: true,
        button: 'Get pro access',
        features: [
            'Everything in the open catalog',
            '8 pro-only components, and counting',
            'Shader Studio, live tuning and export',
            'Collages, full-page compositions',
            'Every future pro release included',
            'One payment, no subscription',
        ],
    },
] as const

type LandingPaymentCardsProps = {
    checkoutHref?: string
}

type PlanCardProps = {
    plan: (typeof PLANS)[number]
    checkoutHref?: string
}

function PlanCard({ plan, checkoutHref }: PlanCardProps) {
    return (
        <div
            className={cn('rounded-lg border w-full flex flex-col justify-between p-10 relative', {
                'border-accent-2/50': plan.highlighted,
            })}
        >
            {plan.highlighted && (
                <div
                    aria-hidden='true'
                    className='absolute lg:-inset-6 -inset-3 pointer-events-none'
                >
                    <svg
                        aria-label='Dashed Frame'
                        className='w-full h-full'
                        viewBox='0 0 100 100'
                        preserveAspectRatio='none'
                    >
                        <rect
                            width='100'
                            height='100'
                            fill='none'
                            vectorEffect='non-scaling-stroke'
                            stroke='currentColor'
                            strokeWidth='3'
                            strokeDasharray={`${DEFAULT_DASH} ${DEFAULT_GAP}`}
                            className='text-accent-3'
                        >
                            <animate
                                attributeName='stroke-dashoffset'
                                values='0;-24'
                                dur='1s'
                                repeatCount='indefinite'
                            />
                        </rect>
                    </svg>
                    {FRAME_HANDLES.map((corner) => (
                        <span
                            key={corner}
                            className={`handle absolute w-2.5 h-2.5 bg-theme-bg ${corner}`}
                        />
                    ))}
                </div>
            )}

            <div className='flex flex-col'>
                <span className='text-xs uppercase font-medium font-mono mb-2'>{plan.label}</span>
                <span className='text-3xl font-medium mb-4'>{plan.title}</span>
            </div>

            <div className='mt-5 mb-20'>
                <p className='font-medium text-5xl mb-5'>{plan.price}</p>
                <ul className='space-y-2 font-medium'>
                    {plan.features.map((feature) => (
                        <li key={feature} className='flex items-center gap-1'>
                            <Check strokeWidth={1.5} className='size-4.5' />
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <Button variant={plan.highlighted ? 'secondary' : 'dashed'} asChild>
                {plan.highlighted ? (
                    <a href={checkoutHref} target='_blank' rel='noopener noreferrer'>
                        {plan.button}
                    </a>
                ) : (
                    <Link href='/catalog'>{plan.button}</Link>
                )}
            </Button>
        </div>
    )
}

export default function LandingPaymentCards({ checkoutHref }: LandingPaymentCardsProps) {
    return (
        <div className='flex flex-col items-center justify-center max-w-5xl w-full mb-80 max-sm:mt-20 min-lg:px-5'>
            <IconPxRobot className='mb-8 size-20 a-float' />
            <span className='text-center text-4xl xxs:text-5xl sm:text-6xl lg:text-7xl font-light font-serif italic'>
                (AI bring the speed)
            </span>

            <span className='text-center text-4xl xxs:text-5xl sm:text-6xl lg:text-7xl font-light tracking-[-0.03em]'>
                Atelier brings the taste.
            </span>

            <p className='text-center max-w-2xl text-lg mt-10 mb-20'>
                Scroll scenes, text effects, WebGL shaders, cursor interactions, and more. The
                catalog grows every week.
                <span className='font-medium'>
                    {' '}
                    Install them with the CLI, prompt your agent, or copy the source.
                </span>
            </p>

            <div className='flex max-lg:flex-col max-lg:gap-8 items-center justify-center gap-15 w-full mb-20'>
                {PLANS.map((plan) => (
                    <PlanCard key={plan.label} plan={plan} checkoutHref={checkoutHref} />
                ))}
            </div>
        </div>
    )
}
