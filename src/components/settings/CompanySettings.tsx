'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'


const PRESET_COLORS = [
  '#21d162', '#075E54', '#128C7E', '#34B7F1',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444',
]

export default function CompanySettings() {
  const { settings, setSettings } = useAppStore()
  const [appName, setAppName] = useState(settings?.app_name || '')
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color || '#21d162')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('company_settings')
      .update({ app_name: appName, primary_color: primaryColor })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) {
      toast.error('Erro ao salvar')
    } else {
      setSettings(data)
      toast.success('Configurações salvas')
    }
    setSaving(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !settings) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('settingsId', settings.id)

      const res = await fetch('/api/upload-logo', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Erro no upload')

      setSettings(json.settings)
      toast.success('Logo atualizada')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer upload da logo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        Configurações da Empresa
      </p>

      {/* Logo */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Logo</p>
        <div className="flex items-center" style={{ gap: 16 }}>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '1px solid var(--border)' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>
              {(settings?.app_name || 'C')[0]}
            </div>
          )}
          <label
            style={{
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              transition: 'var(--transition-fast)',
              opacity: uploading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!uploading) (e.currentTarget as HTMLLabelElement).style.background = 'var(--bg-surface-3)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.background = 'var(--bg-surface-2)' }}
          >
            <Upload size={13} />
            {uploading ? 'Enviando...' : 'Alterar logo'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* App Name */}
      <Input
        label="Nome do aplicativo"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
        placeholder="CRM BoraCar"
      />

      {/* Primary Color */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
          Cor primária
        </p>
        <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setPrimaryColor(color)}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                backgroundColor: color,
                border: primaryColor === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                cursor: 'pointer',
                outline: primaryColor === color ? '2px solid var(--bg-surface)' : 'none',
                outlineOffset: -4,
                transition: 'var(--transition-fast)',
              }}
              title={color}
            />
          ))}
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: 'none', padding: 0 }}
            title="Cor personalizada"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving || !appName} style={{ alignSelf: 'flex-start' }}>
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  )
}
