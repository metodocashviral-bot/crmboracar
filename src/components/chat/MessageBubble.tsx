import { cn, formatTime } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.sender_type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 dark:text-slate-500 italic bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  const isAgent = message.sender_type === 'agent'

  return (
    <div className={cn('flex', isAgent ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[70%] space-y-0.5', isAgent ? 'items-end' : 'items-start')}>
        {isAgent && message.agent && (
          <p className="text-[10px] text-gray-400 dark:text-slate-500 text-right pr-1">
            {message.agent.full_name}
          </p>
        )}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm',
            isAgent
              ? 'bg-green-500 text-white rounded-br-sm'
              : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600 rounded-bl-sm'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className={cn('text-[10px] text-gray-400 dark:text-slate-500 px-1', isAgent ? 'text-right' : 'text-left')}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
