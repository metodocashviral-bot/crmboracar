import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 text-sm transition-all outline-none',
            className
          )}
          style={{
            height: '40px',
            border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '13px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)'
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border)'
            e.currentTarget.style.boxShadow = ''
            props.onBlur?.(e)
          }}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
