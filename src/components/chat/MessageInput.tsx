'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    const text = content.trim()
    if (!text || sending || disabled) return
    setSending(true)
    setContent('')
    await onSend(text)
    setSending(false)
    ref.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
      <div className="flex items-end gap-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2">
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem... (Enter para enviar)"
          rows={1}
          disabled={disabled || sending}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none max-h-32 leading-5"
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 128) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
          className={cn(
            'p-1.5 rounded-lg transition-colors flex-shrink-0',
            content.trim() && !sending && !disabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'text-gray-300 dark:text-slate-600 cursor-not-allowed'
          )}
        >
          <Send size={16} />
        </button>
      </div>
      {disabled && (
        <p className="text-xs text-center text-gray-400 mt-1">
          WhatsApp desconectado — conecte em Configurações
        </p>
      )}
    </div>
  )
}
