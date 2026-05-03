import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 14, md: 20, lg: 28 }

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const px = sizes[size]
  return (
    <div
      className={cn('animate-spin rounded-full flex-shrink-0', className)}
      style={{
        width: px, height: px,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--brand-primary)',
      }}
    />
  )
}
