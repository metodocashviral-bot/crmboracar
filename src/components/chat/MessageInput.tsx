'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

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
    if (ref.current) { ref.current.style.height = 'auto' }
    await onSend(text)
    setSending(false)
    ref.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const canSend = content.trim() && !sending && !disabled

  return (
    <div
      className="flex-shrink-0"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '12px 16px' }}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem... (Enter para enviar)"
          rows={1}
          disabled={disabled || sending}
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 120,
            resize: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 14px',
            fontSize: 14,
            color: 'var(--text-primary)',
            background: 'var(--bg-base)',
            outline: 'none',
            lineHeight: '22px',
            transition: 'var(--transition-fast)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '' }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            width: 40, height: 40,
            borderRadius: 'var(--radius-full)',
            background: canSend ? 'var(--brand-primary)' : 'var(--bg-surface-2)',
            color: canSend ? 'white' : 'var(--text-muted)',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => { if (canSend) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary-hover)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-brand)' } }}
          onMouseLeave={(e) => { if (canSend) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '' } }}
        >
          <Send size={16} />
        </button>
      </div>
      {disabled && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
          WhatsApp desconectado — conecte em Configurações
        </p>
      )}
    </div>
  )
}
