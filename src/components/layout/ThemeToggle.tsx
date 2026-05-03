'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center transition-colors"
      style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', color: 'var(--text-muted)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface-2)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
      title="Alternar tema"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
