import { formatTime } from '@/lib/utils'
import type { Message } from '@/types'
import { FileText, Download } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

function MediaContent({ message, isAgent }: { message: Message; isAgent: boolean }) {
  const { media_url, media_type, content } = message
  if (!media_url) return null

  if (media_type === 'image') {
    return (
      <div style={{ marginBottom: content ? 4 : 0 }}>
        <img
          src={media_url}
          alt="imagem"
          style={{ maxWidth: 280, maxHeight: 320, width: '100%', borderRadius: 8, display: 'block', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => window.open(media_url, '_blank')}
        />
      </div>
    )
  }

  if (media_type === 'video') {
    return (
      <video
        src={media_url}
        controls
        style={{ maxWidth: 280, borderRadius: 8, display: 'block', marginBottom: content ? 4 : 0 }}
      />
    )
  }

  if (media_type === 'audio') {
    return (
      <audio controls src={media_url} style={{ width: 220, display: 'block', marginBottom: content ? 4 : 0 }} />
    )
  }

  // document / file
  return (
    <a
      href={media_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: content ? 4 : 0,
        padding: '8px 10px', borderRadius: 8,
        background: isAgent ? 'rgba(0,0,0,0.12)' : 'var(--bg-surface-2)',
        textDecoration: 'none',
      }}
    >
      <FileText size={20} style={{ color: isAgent ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: isAgent ? 'white' : 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {content || 'Arquivo'}
      </span>
      <Download size={14} style={{ color: isAgent ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', flexShrink: 0 }} />
    </a>
  )
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.sender_type === 'system') {
    return (
      <div className="flex justify-center" style={{ padding: '4px 0' }}>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '3px 12px',
        }}>
          {message.content}
        </span>
      </div>
    )
  }

  const isAgent = message.sender_type === 'agent'
  const hasMedia = !!message.media_url
  const isImageOnly = hasMedia && message.media_type === 'image' && !message.content

  return (
    <div style={{ display: 'flex', justifyContent: isAgent ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
      <div style={{ maxWidth: '72%', position: 'relative' }}>

        {/* Agent name */}
        {isAgent && message.agent && (
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 2, textAlign: 'right', paddingRight: 4 }}>
            {message.agent.full_name}
          </p>
        )}

        {/* Bubble */}
        <div style={{ position: 'relative' }}>
          {/* Tail */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            ...(isAgent ? { right: -6 } : { left: -6 }),
            width: 0, height: 0,
            borderStyle: 'solid',
            ...(isAgent ? {
              borderWidth: '0 0 10px 8px',
              borderColor: `transparent transparent transparent var(--brand-primary)`,
            } : {
              borderWidth: '0 8px 10px 0',
              borderColor: `transparent #fff transparent transparent`,
            }),
            filter: isAgent ? 'none' : 'drop-shadow(1px 1px 0px rgba(0,0,0,0.08))',
          }} />

          <div style={{
            padding: isImageOnly ? 3 : '7px 11px 7px 11px',
            fontSize: 14,
            lineHeight: '20px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            borderRadius: isAgent ? '12px 12px 0 12px' : '12px 12px 12px 0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            ...(isAgent ? {
              background: 'var(--brand-primary)',
              color: 'white',
            } : {
              background: 'white',
              color: '#111',
            }),
          }}>
            {/* Media */}
            {hasMedia && <MediaContent message={message} isAgent={isAgent} />}

            {/* Text */}
            {message.content && !(['document', 'audio', 'video'].includes(message.media_type || '') && !message.media_type) && (
              <span>{message.content}</span>
            )}
            {/* show text for non-doc media */}
            {message.content && message.media_url && !['document'].includes(message.media_type || '') && (
              <span style={{ display: 'none' }} />
            )}

            {/* Timestamp inline */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: isImageOnly ? 0 : 2 }}>
              <span style={{
                fontSize: 11,
                color: isAgent ? 'rgba(255,255,255,0.7)' : '#888',
                marginLeft: 8,
                whiteSpace: 'nowrap',
                ...(isImageOnly ? {
                  position: 'absolute', bottom: 6, right: 8,
                  background: 'rgba(0,0,0,0.45)', borderRadius: 4,
                  padding: '1px 5px', color: 'white',
                } : {}),
              }}>
                {formatTime(message.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
