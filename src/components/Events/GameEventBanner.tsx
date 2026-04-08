import { useEffect, useState } from 'react'
import type { GameEventNotice } from '../../hooks/useGameEvents'

interface Props {
  event: GameEventNotice
  onDismiss: (id: string) => void
}

const DURATION = 5000

export default function GameEventBanner({ event, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  // Trigger enter animation on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(event.id), 350)
    }, DURATION)
    return () => clearTimeout(t)
  }, [event.id, onDismiss])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => onDismiss(event.id), 350)
  }

  return (
    <div
      className="transition-all duration-350 ease-out"
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
      }}
    >
      <div
        className="relative rounded-3xl overflow-hidden border"
        style={{
          background: `linear-gradient(135deg, var(--surface-section) 0%, ${event.accentBg} 100%)`,
          borderColor: `${event.accent}50`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 40px ${event.accent}18`,
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${event.accent}90, transparent)` }}
        />

        <div className="flex items-start gap-4 px-5 pt-4 pb-3">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: event.accentBg,
              border: `1px solid ${event.accent}35`,
              boxShadow: `0 0 20px ${event.accent}20`,
            }}
          >
            <img src={event.iconUrl} alt="" className="w-9 h-9" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p
              className="font-cinzel font-bold text-sm tracking-widest uppercase leading-none mb-2"
              style={{ color: event.accent }}
            >
              {event.title}
            </p>
            <p className="font-body text-xs text-text-secondary leading-relaxed">
              {event.message}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-elevated shrink-0 mt-0.5 cursor-pointer text-xs transition-all border border-transparent hover:border-border/50"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        {/* Timer drain bar */}
        <div className="mx-5 mb-3.5 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full event-timer-bar"
            style={{
              background: event.accent,
              animationDuration: `${DURATION}ms`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
