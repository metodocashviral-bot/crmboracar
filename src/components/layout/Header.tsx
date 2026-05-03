'use client'

import { Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAppStore } from '@/stores/appStore'

interface HeaderProps {
  title: string
  actions?: React.ReactNode
}

export default function Header({ title, actions }: HeaderProps) {
  const { toggleSidebar } = useAppStore()

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center px-4 gap-3 flex-shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors lg:hidden"
      >
        <Menu size={18} />
      </button>
      <h1 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h1>
      <div className="flex-1" />
      {actions}
      <ThemeToggle />
    </header>
  )
}
