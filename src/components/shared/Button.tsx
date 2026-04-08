import { type ButtonHTMLAttributes } from 'react'

type Variant = 'order' | 'chaos' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
}

const variantClasses: Record<Variant, string> = {
  order:  'bg-order-gold/20 hover:bg-order-gold/30 text-order-gold border border-order-gold/35 hover:border-order-gold/70 hover:shadow-glow-gold',
  chaos:  'bg-chaos-red/20 hover:bg-chaos-red/30 text-chaos-red border border-chaos-red/35 hover:border-chaos-red/70 hover:shadow-glow-red',
  ghost:  'bg-transparent hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border hover:border-border-bright',
  danger: 'bg-transparent hover:bg-chaos-red/15 text-chaos-red/60 border border-chaos-red/20 hover:border-chaos-red/60 hover:text-chaos-red',
}

const sizeClasses = {
  sm: 'px-5 py-2.5 text-xs',
  md: 'px-6 py-3 text-sm',
}

export default function Button({ variant = 'ghost', size = 'md', className = '', children, ...props }: Props) {
  return (
    <button
      {...props}
      className={`
        font-cinzel tracking-wide rounded-full transition-all duration-200 cursor-pointer font-semibold
        disabled:opacity-40 disabled:cursor-not-allowed active:scale-95
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
    >
      {children}
    </button>
  )
}
