import { useMemo, useState } from 'react'
import { type TaskStatus, Priority } from '../../types'
import { useAppContext } from '../../context/AppContext'
import TaskCard from './TaskCard'
import Button from '../shared/Button'
import shamblingZombieUrl from '../../../assets/shambling-zombie.svg'
import armorBlueprintUrl from '../../../assets/armor-blueprint.svg'
import emperorCardUrl from '../../../assets/tarot-04-the-emperor.svg'

interface Props {
  status: TaskStatus
  label: string
  subLabel: string
}

type SortMode = 'newest' | 'priority' | 'dueDate'

const PRIORITY_ORDER = { [Priority.High]: 0, [Priority.Medium]: 1, [Priority.Low]: 2 }

interface ColumnTheme {
  accentBar: string
  headerGradient: string
  headerColor: string
  countBg: string
  countText: string
  countBorder: string
  emptyIcon: string
  emptyIconSrc: string
  dotColor: string
}

const columnTheme: Record<string, ColumnTheme> = {
  backlog: {
    accentBar:      'from-red-600 via-red-500 to-red-400',
    headerGradient: 'col-accent-backlog',
    headerColor:    'text-red-400',
    countBg:        'bg-red-500/15',
    countText:      'text-red-400',
    countBorder:    'border-red-500/30',
    emptyIcon:      '🌑',
    emptyIconSrc:   shamblingZombieUrl,
    dotColor:       'bg-red-400',
  },
  inProgress: {
    accentBar:      'from-yellow-700 via-yellow-500 to-yellow-400',
    headerGradient: 'col-accent-progress',
    headerColor:    'text-order-gold',
    countBg:        'bg-order-gold/15',
    countText:      'text-order-gold',
    countBorder:    'border-order-gold/30',
    emptyIcon:      '⚔',
    emptyIconSrc:   armorBlueprintUrl,
    dotColor:       'bg-order-gold',
  },
  done: {
    accentBar:      'from-green-800 via-green-600 to-green-400',
    headerGradient: 'col-accent-done',
    headerColor:    'text-green-400',
    countBg:        'bg-green-500/15',
    countText:      'text-green-400',
    countBorder:    'border-green-500/30',
    emptyIcon:      '🏆',
    emptyIconSrc:   emperorCardUrl,
    dotColor:       'bg-green-400',
  },
}

export default function TaskColumn({ status, label, subLabel }: Props) {
  const { state, dispatch } = useAppContext()
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const theme = columnTheme[status]

  const tasks = useMemo(() => {
    const filtered = state.tasks.filter(t => {
      if (t.status !== status) return false
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        return t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)
      }
      return true
    })

    if (sortMode === 'priority') {
      return [...filtered].sort((a, b) => {
        const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        return pd !== 0 ? pd : b.createdAt - a.createdAt
      })
    }
    if (sortMode === 'dueDate') {
      return [...filtered].sort((a, b) => {
        if (!a.dueAt && !b.dueAt) return b.createdAt - a.createdAt
        if (!a.dueAt) return 1
        if (!b.dueAt) return -1
        return a.dueAt - b.dueAt
      })
    }
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt)
  }, [state.tasks, state.searchQuery, status, sortMode])

  function openAddModal() {
    dispatch({ type: 'OPEN_MODAL', payload: { mode: 'add', defaultStatus: status } })
  }

  const sortLabel = sortMode === 'newest' ? 'New' : sortMode === 'priority' ? 'Pri' : 'Due'
  const nextSort: SortMode = sortMode === 'newest' ? 'priority' : sortMode === 'priority' ? 'dueDate' : 'newest'

  return (
    <div
      data-testid={`column-${status}`}
      className="flex flex-col rounded-3xl border border-border/60 overflow-hidden"
      style={{
        background: 'var(--surface-section)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
        minHeight: '520px',
      }}
    >
      {/* Thick colored top bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${theme.accentBar}`} />

      {/* Column header */}
      <div className={`px-5 pt-5 pb-4 ${theme.headerGradient}`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.dotColor}`} />
            <h3 className={`font-cinzel font-bold text-sm tracking-widest uppercase ${theme.headerColor} leading-none`}>
              {label}
            </h3>
          </div>
          <span
            data-testid="column-count"
            className={`font-cinzel font-bold text-sm px-3 py-1 rounded-full border ${theme.countBg} ${theme.countText} ${theme.countBorder} shrink-0 leading-none`}
            aria-label={`${tasks.length} tasks in ${label}`}
            role="status"
          >
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-text-muted font-body tracking-wide">{subLabel}</p>
          <button
            onClick={() => setSortMode(nextSort)}
            className="text-text-muted hover:text-text-secondary text-[10px] font-body px-2.5 py-1 rounded-full hover:bg-surface-elevated transition-all cursor-pointer border border-transparent hover:border-border/60"
            title={`Sort by: ${nextSort}`}
          >
            ↕ {sortLabel}
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <img
              src={theme.emptyIconSrc}
              alt=""
              aria-hidden="true"
              className="w-12 h-12 opacity-15"
            />
            <p className="text-center text-text-muted text-xs font-body italic">
              {status === 'done' ? 'No victories yet...' : state.searchQuery ? 'No matches found.' : 'The field is quiet...'}
            </p>
          </div>
        )}
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Add button */}
      <div className="p-3 pt-2 border-t border-border/30">
        <Button
          variant={status === 'done' ? 'ghost' : 'order'}
          size="sm"
          onClick={openAddModal}
          className="w-full text-center"
        >
          + Issue Orders
        </Button>
      </div>
    </div>
  )
}
