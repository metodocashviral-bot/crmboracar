'use client'

import { useState, useRef, useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'
import type { WhatsAppStatus } from '@/types'

export function useWhatsAppStatus() {
  const { setWhatsappStatus } = useAppStore()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const startPolling = useCallback(() => {
    stopPolling()
    pollingRef.current = setInterval(async () => {
      try {
        const [qrRes, statusRes] = await Promise.all([
          fetch('/api/whatsapp/qrcode'),
          fetch('/api/whatsapp/status'),
        ])

        if (statusRes.ok) {
          const { state, number } = await statusRes.json()
          if (state === 'open') {
            stopPolling()
            setWhatsappStatus('connected')
            setConnectedNumber(number || null)
            setQrCode(null)
            return
          }
        }

        if (qrRes.ok) {
          const data = await qrRes.json()
          // Evolution API pode retornar base64 em vários formatos
          const base64 =
            data?.base64 ||
            data?.qrcode?.base64 ||
            data?.data?.base64 ||
            null
          if (base64) {
            setQrCode(base64)
            setWhatsappStatus('qr_code')
          }
        }
      } catch {
        // silently retry
      }
    }, 3000)
  }, [setWhatsappStatus])

  async function connect() {
    setWhatsappStatus('connecting')
    setQrCode(null)
    const res = await fetch('/api/whatsapp/connect', { method: 'POST' })
    if (!res.ok) {
      setWhatsappStatus('disconnected')
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `Erro ${res.status}`)
    }
    startPolling()
  }

  async function disconnect() {
    stopPolling()
    await fetch('/api/whatsapp/disconnect', { method: 'POST' })
    setWhatsappStatus('disconnected')
    setQrCode(null)
    setConnectedNumber(null)
  }

  return { qrCode, connectedNumber, connect, disconnect, stopPolling }
}
