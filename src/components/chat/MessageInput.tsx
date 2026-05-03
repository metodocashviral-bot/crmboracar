'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff, X, Image, FileText, Music } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onSendMedia: (file: File, caption: string, mediaType: string) => Promise<void>
  disabled?: boolean
}

type AttachType = 'image' | 'document' | 'audio' | null

export default function MessageInput({ onSend, onSendMedia, disabled }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [preview, setPreview] = useState<{ file: File; type: AttachType; url: string } | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const canSend = (content.trim() || preview) && !sending && !disabled && !recording

  async function handleSend() {
    if (sending || disabled) return
    if (preview) {
      setSending(true)
      await onSendMedia(preview.file, content.trim(), preview.type || 'document')
      setPreview(null)
      setContent('')
      setSending(false)
      return
    }
    const text = content.trim()
    if (!text) return
    setSending(true)
    setContent('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await onSend(text)
    setSending(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function openFilePicker(accept: string) {
    setShowAttachMenu(false)
    if (fileRef.current) {
      fileRef.current.accept = accept
      fileRef.current.click()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    const type: AttachType = isImage ? 'image' : isAudio ? 'audio' : 'document'
    const url = URL.createObjectURL(file)
    setPreview({ file, type, url })
    e.target.value = ''
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setPreview({ file, type: 'audio', url })
        setRecording(false)
        setRecordSeconds(0)
        if (timerRef.current) clearInterval(timerRef.current)
      }
      recorder.start()
      setRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
    } catch {
      alert('Permissão para microfone negada')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function cancelPreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
    setContent('')
  }

  const formatSecs = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex-shrink-0" style={{ background: '#f0f2f5', borderTop: '1px solid var(--border)' }}>
      {/* File preview bar */}
      {preview && (
        <div style={{ padding: '8px 16px', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {preview.type === 'image' && (
            <img src={preview.url} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
          )}
          {preview.type === 'audio' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Music size={20} style={{ color: 'var(--brand-primary)' }} />
              <audio src={preview.url} controls style={{ height: 32 }} />
            </div>
          )}
          {preview.type === 'document' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{preview.file.name}</span>
            </div>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={cancelPreview} style={{ padding: 4, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Recording bar */}
      {recording && (
        <div style={{ padding: '10px 16px', background: '#fff3f3', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>{formatSecs(recordSeconds)}</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>Gravando áudio...</span>
          <button onClick={stopRecording} style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', padding: '4px 10px', border: '1px solid #fecaca', borderRadius: 6, background: 'white', cursor: 'pointer' }}>
            Parar
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end" style={{ padding: '10px 12px', gap: 8, position: 'relative' }}>

        {/* Attach menu */}
        {showAttachMenu && (
          <div style={{
            position: 'absolute', bottom: 64, left: 12,
            background: 'white', borderRadius: 12, padding: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', gap: 2, zIndex: 10, minWidth: 180,
          }}>
            <button onClick={() => openFilePicker('image/*,video/*')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
            >
              <Image size={18} style={{ color: '#8b5cf6' }} /> Imagem / Vídeo
            </button>
            <button onClick={() => openFilePicker('.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
            >
              <FileText size={18} style={{ color: '#3b82f6' }} /> Documento
            </button>
          </div>
        )}

        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />

        {/* Attach button */}
        <button
          onClick={() => setShowAttachMenu((v) => !v)}
          disabled={disabled || recording}
          style={{ width: 40, height: 40, borderRadius: '50%', background: showAttachMenu ? 'var(--brand-primary)' : 'transparent', color: showAttachMenu ? 'white' : '#54656f', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: '0.15s' }}
        >
          <Paperclip size={20} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={handleKeyDown}
          placeholder={preview ? 'Adicionar legenda...' : 'Digite uma mensagem'}
          rows={1}
          disabled={disabled || sending || recording}
          onClick={() => setShowAttachMenu(false)}
          style={{
            flex: 1, minHeight: 40, maxHeight: 120,
            resize: 'none', border: 'none', borderRadius: 10,
            padding: '10px 14px', fontSize: 15,
            color: '#111', background: 'white', outline: 'none', lineHeight: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        />

        {/* Send / Mic button */}
        {content.trim() || preview ? (
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canSend ? 'pointer' : 'not-allowed', flexShrink: 0, transition: '0.15s', opacity: sending ? 0.6 : 1 }}
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={disabled}
            style={{ width: 40, height: 40, borderRadius: '50%', background: recording ? '#ef4444' : 'var(--brand-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: '0.15s' }}
          >
            {recording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>

      {disabled && !recording && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8 }}>
          WhatsApp desconectado — conecte em Configurações
        </p>
      )}
    </div>
  )
}
