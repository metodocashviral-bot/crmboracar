'use client'

import { QrCode, Wifi, WifiOff, Unplug } from 'lucide-react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus'
import { useAppStore } from '@/stores/appStore'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function WhatsAppConnect() {
  const { whatsappStatus, settings, setSettings } = useAppStore()
  const { qrCode, connectedNumber, connect, disconnect } = useWhatsAppStatus()

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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Conexão WhatsApp</h3>

      {whatsappStatus === 'disconnected' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <WifiOff size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp não conectado</p>
          <Button onClick={handleConnect}>
            <QrCode size={16} className="mr-2" />
            Conectar WhatsApp
          </Button>
        </div>
      )}

      {whatsappStatus === 'connecting' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Iniciando conexão...</p>
        </div>
      )}

      {whatsappStatus === 'qr_code' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Escaneie o QR Code com seu WhatsApp
          </p>
          {qrCode ? (
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <img
                src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="QR Code WhatsApp"
                className="w-52 h-52 object-contain"
              />
            </div>
          ) : (
            <div className="w-52 h-52 flex items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-xl">
              <Spinner />
            </div>
          )}
          <p className="text-xs text-gray-400">Atualizando automaticamente...</p>
        </div>
      )}

      {whatsappStatus === 'connected' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Wifi size={28} className="text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">Conectado ✓</p>
            {(connectedNumber || settings?.whatsapp_number) && (
              <p className="text-xs text-gray-500 mt-1">
                {connectedNumber || settings?.whatsapp_number}
              </p>
            )}
          </div>
          <Button variant="danger" onClick={handleDisconnect}>
            <Unplug size={14} className="mr-2" />
            Desconectar
          </Button>
        </div>
      )}
    </div>
  )
}
