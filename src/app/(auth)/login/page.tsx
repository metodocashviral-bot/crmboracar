'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [appName, setAppName] = useState('CRM BoraCar')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('company_settings').select('logo_url, app_name').limit(1).single().then(({ data }) => {
      if (data?.logo_url) setLogoUrl(data.logo_url)
      if (data?.app_name) setAppName(data.app_name)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email ou senha incorretos')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,209,98,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,209,98,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)',
            padding: 40,
          }}
        >
          {/* Logo + badge */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* WhatsApp badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(33,209,98,0.12)', border: '1px solid rgba(33,209,98,0.3)', marginBottom: 14 }}>
              <svg width="11" height="11" fill="#21d162" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#21d162', letterSpacing: '0.04em' }}>WhatsApp CRM</span>
            </div>

            {/* Company logo */}
            <div style={{ margin: '0 auto 16px', width: 72, height: 72 }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ width: 72, height: 72, borderRadius: 'var(--radius-xl)', objectFit: 'contain', border: '1px solid var(--border)', background: 'white', padding: 4 }}
                />
              ) : (
                <div
                  style={{
                    width: 72, height: 72,
                    background: 'var(--brand-primary)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-brand)',
                  }}
                >
                  <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
              )}
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{appName}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{
                  width: '100%', height: 40, padding: '0 14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-base)', color: 'var(--text-primary)',
                  fontSize: 14, outline: 'none', transition: 'var(--transition-fast)', boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '' }}
              />
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Senha</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', height: 40, padding: '0 14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-base)', color: 'var(--text-primary)',
                  fontSize: 14, outline: 'none', transition: 'var(--transition-fast)', boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-glow)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 44, marginTop: 4,
                background: loading ? 'var(--bg-surface-2)' : 'var(--brand-primary)',
                color: loading ? 'var(--text-muted)' : 'white',
                border: 'none', borderRadius: 'var(--radius-lg)',
                fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-fast)',
                boxShadow: loading ? 'none' : 'var(--shadow-brand)',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary-hover)' }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-primary)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
