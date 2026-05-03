import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
          {
            'bg-green-500 hover:bg-green-600 text-white': variant === 'primary',
            'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200': variant === 'secondary',
            'bg-red-500 hover:bg-red-600 text-white': variant === 'danger',
            'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300': variant === 'ghost',
          },
          {
            'text-xs px-2.5 py-1.5': size === 'sm',
            'text-sm px-4 py-2': size === 'md',
            'text-base px-5 py-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
