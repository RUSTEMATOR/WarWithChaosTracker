import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { TaskStatus, Priority } from '../../types'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  [Priority.High]:   { label: 'Crusade',  color: 'text-red-400',    dot: 'bg-red-500' },
  [Priority.Medium]: { label: 'Campaign', color: 'text-order-gold', dot: 'bg-order-gold' },
  [Priority.Low]:    { label: 'Skirmish', color: 'text-zinc-400',   dot: 'bg-zinc-500' },
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function durationInSystem(createdAt: number, completedAt: number): string {
  const diff = completedAt - createdAt
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days === 0) return hours <= 1 ? 'under an hour' : `${hours}h`
  if (days === 1) return '1 day'
  return `${days} days`
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CampaignChronicle({ isOpen, onClose }: Props) {
  const { state } = useAppContext()
  const [filter, setFilter] = useState<Priority | 'all'>('all')

  const completed = state.tasks
    .filter(t => t.status === TaskStatus.Done)
    .filter(t => filter === 'all' || t.priority === filter)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))

  const total = state.tasks.filter(t => t.status === TaskStatus.Done).length

  if (!isOpen) return null

  return (
    <div
      className="mx-5 mb-8 rounded-3xl border border-border/60 overflow-hidden animate-fade-in"
      style={{
        background: 'var(--surface-section)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #B8922A, #F2C94C, #B8922A)' }}
      />
      <div className="px-6 pt-5 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="font-cinzel font-bold text-order-gold text-sm tracking-widest uppercase">
                Campaign Chronicle
              </h2>
              <p className="font-body text-text-muted text-xs mt-0.5">
                {total} {total === 1 ? 'victory' : 'victories'} recorded · all-time deeds of the Empire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all cursor-pointer text-sm border border-transparent hover:border-border/60"
            aria-label="Close Chronicle"
          >
            ✕
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {(['all', Priority.High, Priority.Medium, Priority.Low] as const).map(p => {
            const isActive = filter === p
            const cfg = p !== 'all' ? PRIORITY_CONFIG[p] : null
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-order-gold/15 border-order-gold/50 text-order-gold'
                    : 'border-border/50 text-text-muted hover:text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                {p === 'all' ? 'All' : cfg!.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Entry list */}
      <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
        {completed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl opacity-20">📜</span>
            <p className="font-body text-text-muted text-xs italic text-center">
              {filter !== 'all'
                ? 'No victories of this rank recorded.'
                : 'The chronicle is empty. Complete your first task to begin the record.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {completed.map((task, i) => {
              const cfg = PRIORITY_CONFIG[task.priority]
              const completedTs = task.completedAt ?? task.createdAt
              return (
                <div
                  key={task.id}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-surface-elevated/40 transition-colors"
                >
                  {/* Index number */}
                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-cinzel font-bold text-[10px] text-text-muted mt-0.5"
                    style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
                  >
                    {i + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-body text-sm text-text-primary font-medium leading-snug line-through decoration-text-muted/50">
                        {task.title}
                      </p>
                      <span className={`shrink-0 inline-flex items-center gap-1 font-body text-[10px] font-medium ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="font-body text-xs text-text-muted mt-1 line-clamp-1 italic">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="font-body text-[11px] text-text-muted">
                        ✓ {formatDate(completedTs)}
                      </span>
                      <span className="font-body text-[11px] text-text-muted opacity-60">
                        {timeAgo(completedTs)}
                      </span>
                      <span
                        className="font-body text-[11px] px-2 py-0.5 rounded-full border border-border/40 text-text-muted"
                        style={{ background: 'var(--surface-elevated)' }}
                        title="Time from creation to completion"
                      >
                        ⏱ {durationInSystem(task.createdAt, completedTs)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {completed.length > 0 && (
        <div className="px-6 py-3 border-t border-border/30 flex items-center justify-between">
          <span className="font-body text-text-muted text-xs">
            Showing {completed.length} of {total} {total === 1 ? 'entry' : 'entries'}
          </span>
          <span className="font-cinzel text-[10px] text-order-gold/60 tracking-widest uppercase">
            For Sigmar and the Empire
          </span>
        </div>
      )}
    </div>
  )
}
