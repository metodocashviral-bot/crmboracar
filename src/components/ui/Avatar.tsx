import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name?: string
  phone?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500']

function getColor(str?: string) {
  if (!str) return colors[0]
  const idx = str.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function Avatar({ name, phone, src, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name, phone)
  const color = getColor(name || phone)

  if (src) {
    return (
      <img
        src={src}
        alt={name || phone || ''}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        sizeClasses[size],
        color,
        className
      )}
    >
      {initials}
    </div>
  )
}
