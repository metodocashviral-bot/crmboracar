'use client'

import { useState, useEffect } from 'react'
import { QrCode, Wifi, WifiOff, Unplug, RefreshCw, Link2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function WhatsAppConnect() {
  const { whatsappStatus, settings, setSettings } = useAppStore()
  const { qrCode, connectedNumber, connect, disconnect } = useWhatsAppStatus()
  const [syncing, setSyncing] = useState(false)
  const [webhookSyncing, setWebhookSyncing] = useState(false)

  // Auto-sync webhook URL whenever the component loads in connected state
  useEffect(() => {
    if (whatsappStatus === 'connected') {
      fetch('/api/whatsapp/sync-webhook', { method: 'POST' }).catch(() => {})
    }
  }, [whatsappStatus])

  async function handleSyncWebhook() {
    setWebhookSyncing(true)
    try {
      const res = await fetch('/api/whatsapp/sync-webhook', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Webhook atualizado com sucesso')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar webhook')
    } finally {
      setWebhookSyncing(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/whatsapp/import-chats', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`${json.imported} conversa${json.imported !== 1 ? 's' : ''} importada${json.imported !== 1 ? 's' : ''}`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  async function handleConnect() {
    try {
      await connect()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao conectar')
    }
  }

  async function handleDisconnect() {
    await disconnect()
    const supabase = createClient()
    const { data } = await supabase.from('company_settings').select('*').limit(1).single()
    if (data) setSettings(data)
    toast.success('WhatsApp desconectado')
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
        Conexão WhatsApp
      </p>

      {whatsappStatus === 'disconnected' && (
        <div className="flex flex-col items-center" style={{ gap: 16, padding: '16px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WifiOff size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>WhatsApp não conectado</p>
          <Button onClick={handleConnect}>
            <QrCode size={15} className="mr-2" />
            Conectar WhatsApp
          </Button>
        </div>
      )}

      {whatsappStatus === 'connecting' && (
        <div className="flex flex-col items-center" style={{ gap: 16, padding: '16px 0' }}>
          <Spinner size="lg" />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Iniciando conexão...</p>
        </div>
      )}

      {whatsappStatus === 'qr_code' && (
        <div className="flex flex-col items-center" style={{ gap: 16, padding: '16px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Escaneie o QR Code com seu WhatsApp
          </p>
          {qrCode ? (
            <div style={{ padding: 12, background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <img
                src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="QR Code WhatsApp"
                style={{ width: 208, height: 208, objectFit: 'contain', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{ width: 208, height: 208, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)' }}>
              <Spinner />
            </div>
          )}
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Atualizando automaticamente...</p>
        </div>
      )}

      {whatsappStatus === 'connected' && (
        <div className="flex flex-col items-center" style={{ gap: 16, padding: '16px 0' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(33,209,98,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wifi size={28} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <span style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: 'var(--brand-primary)', border: '2px solid var(--bg-surface)', display: 'block' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-primary)' }}>Conectado</p>
            {(connectedNumber || settings?.whatsapp_number) && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {connectedNumber || settings?.whatsapp_number}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
            <Button variant="secondary" onClick={handleSyncWebhook} disabled={webhookSyncing} style={{ width: '100%' }}>
              <Link2 size={13} className="mr-1.5" />
              {webhookSyncing ? 'Atualizando...' : 'Atualizar Webhook'}
            </Button>
            <Button variant="secondary" onClick={handleSync} disabled={syncing} style={{ width: '100%' }}>
              <RefreshCw size={13} className="mr-1.5" style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Importando...' : 'Importar Conversas'}
            </Button>
            <Button variant="danger" onClick={handleDisconnect} style={{ width: '100%' }}>
              <Unplug size={14} className="mr-2" />
              Desconectar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
