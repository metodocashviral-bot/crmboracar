import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none',
          {
            'text-white': variant === 'primary' || variant === 'danger',
            'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]': variant === 'secondary',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)]': variant === 'ghost',
            'bg-[#ef4444] hover:bg-[#dc2626]': variant === 'danger',
          },
          {
            'h-8 px-3 text-xs rounded-[var(--radius-sm)]': size === 'sm',
            'h-9 px-4 text-sm rounded-[var(--radius-md)]': size === 'md',
            'h-10 px-5 text-sm rounded-[var(--radius-md)]': size === 'lg',
          },
          className
        )}
        style={variant === 'primary' ? {
          background: 'var(--brand-primary)',
          borderRadius: 'var(--radius-md)',
          ...style,
        } : style}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-brand)'
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = ''
          }
          props.onMouseLeave?.(e)
        }}
        {...props}
      >
        {loading ? <Spinner size="sm" className="mr-2" /> : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
