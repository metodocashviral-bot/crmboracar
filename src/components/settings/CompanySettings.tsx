'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const PRESET_COLORS = [
  '#25D366', '#075E54', '#128C7E', '#34B7F1',
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444',
]

export default function CompanySettings() {
  const { settings, setSettings } = useAppStore()
  const [appName, setAppName] = useState(settings?.app_name || '')
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color || '#25D366')
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
    const supabase = createClient()
    const path = `logos/${settings.id}-${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (uploadError) {
      toast.error('Erro ao fazer upload da logo')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
    const logoUrl = urlData.publicUrl

    const { data, error } = await supabase
      .from('company_settings')
      .update({ logo_url: logoUrl })
      .eq('id', settings.id)
      .select()
      .single()

    if (!error && data) {
      setSettings(data)
      toast.success('Logo atualizada')
    }
    setUploading(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">Configurações da Empresa</h3>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
        <div className="flex items-center gap-4">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-cover border" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-xl">
              {(settings?.app_name || 'C')[0]}
            </div>
          )}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 transition-colors">
            <Upload size={14} />
            {uploading ? 'Enviando...' : 'Alterar logo'}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cor primária
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setPrimaryColor(color)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: primaryColor === color ? '#000' : 'transparent',
              }}
              title={color}
            />
          ))}
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
            title="Cor personalizada"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving || !appName}>
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  )
}
