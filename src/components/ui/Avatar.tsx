import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name?: string
  phone?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ring?: boolean
}

const sizes = { xs: 24, sm: 28, md: 32, lg: 36, xl: 48 }
const fontSizes = { xs: 10, sm: 11, md: 12, lg: 13, xl: 16 }
const PALETTE = ['#21d162', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

function getColor(str?: string) {
  if (!str) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export default function Avatar({ name, phone, src, size = 'md', className, ring }: AvatarProps) {
  const px = sizes[size]
  const fs = fontSizes[size]
  const initials = getInitials(name, phone)
  const color = getColor(name || phone)

  if (src) {
    return (
      <img
        src={src}
        alt={name || phone || ''}
        className={cn('object-cover flex-shrink-0', className)}
        style={{ width: px, height: px, borderRadius: 'var(--radius-full)', outline: ring ? '2px solid var(--brand-primary)' : undefined, outlineOffset: ring ? '1px' : undefined }}
      />
    )
  }

  return (
    <div
      className={cn('flex-shrink-0 flex items-center justify-center font-bold text-white', className)}
      style={{
        width: px, height: px,
        borderRadius: 'var(--radius-full)',
        background: color,
        fontSize: fs,
        outline: ring ? '2px solid var(--brand-primary)' : undefined,
        outlineOffset: ring ? '1px' : undefined,
      }}
    >
      {initials}
    </div>
  )
}
