'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface FollowUpModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (date: string) => void
}

export default function FollowUpModal({ open, onClose, onConfirm }: FollowUpModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')

  function handleConfirm() {
    if (!date) return
    const isoDate = new Date(`${date}T${time}:00`).toISOString()
    onConfirm(isoDate)
  }

  return (
    <Modal open={open} onClose={onClose} title="Agendar Retorno" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Horário
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={!date}>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
