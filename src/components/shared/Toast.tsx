import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'order' | 'chaos' | 'neutral'
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type = 'order', onDismiss, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300) }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  const style = type === 'order'
    ? { border: 'border-order-gold/40', icon: '⚔', iconBg: 'bg-order-gold/15', iconColor: 'text-order-gold' }
    : type === 'chaos'
    ? { border: 'border-red-400/40', icon: '✦', iconBg: 'bg-red-500/15', iconColor: 'text-red-400' }
    : { border: 'border-border', icon: 'ℹ', iconBg: 'bg-surface-elevated', iconColor: 'text-text-muted' }

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl border ${style.border}
        font-body text-sm text-text-primary transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      style={{
        background: 'var(--surface-section)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs shrink-0 ${style.iconBg} ${style.iconColor}`}>
        {style.icon}
      </span>
      <span className="flex-1 pt-0.5">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
        className="w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all cursor-pointer text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

interface ToastItem {
  id: string
  message: string
  type: 'order' | 'chaos' | 'neutral'
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}
