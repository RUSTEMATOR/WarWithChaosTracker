import { useEffect, useRef, useState } from 'react'
import { type Task, TaskStatus, Priority } from '../../types'
import { useAppContext } from '../../context/AppContext'
import { canAdvance, canRetreat, nextStatus, prevStatus } from '../../utils/taskHelpers'
import { computeCorruption, getChaosGodMark } from '../../utils/warMath'
import { useCorruptedText } from '../../hooks/useCorruptedText'
import Badge from '../shared/Badge'
import ringedTentacleUrl from '../../../assets/ringed-tentacle.svg'
import shamblingZombieUrl from '../../../assets/shambling-zombie.svg'
import glassHeartUrl from '../../../assets/glass-heart.svg'
import disintegrateUrl from '../../../assets/disintegrate.svg'

const CHAOS_GOD_ICON: Record<string, string> = {
  Tzeentch: ringedTentacleUrl,
  Nurgle:   shamblingZombieUrl,
  Slaanesh: glassHeartUrl,
  Khorne:   disintegrateUrl,
}

interface Props {
  task: Task
}

const PRIORITY_ACCENT: Record<Priority, string> = {
  [Priority.High]:   'bg-red-500',
  [Priority.Medium]: 'bg-yellow-400',
  [Priority.Low]:    'bg-zinc-500',
}

const CORRUPTION_CLASSES: Record<number, string> = {
  0: 'border-border/50',
  1: 'border-chaos-red/25',
  2: 'border-chaos-red/55',
  3: 'border-chaos-red animate-corruption-pulse',
}

function formatDueDate(dueAt: number): { text: string; overdue: boolean } {
  const now = Date.now()
  const overdue = dueAt < now
  const date = new Date(dueAt)
  const text = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return { text, overdue }
}

export default function TaskCard({ task }: Props) {
  const { dispatch } = useAppContext()
  const [justDone, setJustDone] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const prevStatusRef = useRef(task.status)
  const now = Date.now()

  const corruption = computeCorruption(task, now)
  const chaosGod = getChaosGodMark(task, now)
  const isDone = task.status === TaskStatus.Done
  const corruptedTitle = useCorruptedText(task.title, isDone ? 0 : corruption)

  useEffect(() => {
    if (prevStatusRef.current !== TaskStatus.Done && task.status === TaskStatus.Done) {
      setJustDone(true)
      const t = setTimeout(() => setJustDone(false), 700)
      return () => clearTimeout(t)
    }
    prevStatusRef.current = task.status
  }, [task.status])

  useEffect(() => {
    if (!confirmDelete) return
    const t = setTimeout(() => setConfirmDelete(false), 3000)
    return () => clearTimeout(t)
  }, [confirmDelete])

  function advance() {
    dispatch({ type: 'MOVE_TASK', payload: { id: task.id, status: nextStatus(task.status) } })
  }
  function retreat() {
    dispatch({ type: 'MOVE_TASK', payload: { id: task.id, status: prevStatus(task.status) } })
  }
  function edit() {
    dispatch({ type: 'OPEN_MODAL', payload: { mode: 'edit', editingTaskId: task.id } })
  }
  function handleDelete() {
    if (confirmDelete) {
      dispatch({ type: 'DELETE_TASK', payload: { id: task.id } })
    } else {
      setConfirmDelete(true)
    }
  }

  const borderClass = isDone
    ? 'border-order-gold/12'
    : CORRUPTION_CLASSES[corruption] ?? 'border-border/50'

  return (
    <div
      data-testid="task-card"
      className={`
        task-card relative rounded-2xl border overflow-hidden animate-fade-in
        ${borderClass}
        ${isDone ? 'opacity-65' : ''}
        ${justDone ? 'animate-victory-pulse' : ''}
      `}
      style={{
        background: isDone ? 'var(--surface-done)' : 'var(--surface-card)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
      }}
    >
      {/* Priority left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isDone ? 'bg-green-500/50' : PRIORITY_ACCENT[task.priority]}`}
      />

      <div className="pl-5 pr-4 pt-4 pb-3.5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <p className={`text-sm font-body font-semibold leading-snug flex-1 ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {corruptedTitle}
          </p>
          <div className="shrink-0 mt-0.5">
            <Badge priority={task.priority} thematic />
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-text-muted font-body leading-relaxed line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Metadata row */}
        {(task.dueAt || chaosGod) && !isDone && (
          <div className="flex items-center flex-wrap gap-1.5 mb-3">
            {task.dueAt && (() => {
              const { text, overdue } = formatDueDate(task.dueAt)
              return (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[11px] font-medium
                  ${overdue
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-surface-elevated text-text-secondary border border-border/50'
                  }`}
                >
                  {overdue ? '⚠' : '📅'} {text}
                </span>
              )
            })()}
            {chaosGod && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[11px] font-medium bg-surface-elevated border border-border/50 ${chaosGod.color}`}
                title={chaosGod.flavor}
              >
                <img src={CHAOS_GOD_ICON[chaosGod.god]} alt="" className="w-3.5 h-3.5 opacity-75" />
                {chaosGod.god}
              </span>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          {/* Move buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={retreat}
              disabled={!canRetreat(task.status)}
              data-testid="btn-retreat"
              className="flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-elevated disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer text-xs border border-transparent hover:border-border/50"
              aria-label="Retreat task"
              title="Retreat"
            >
              ◀
            </button>
            <button
              onClick={advance}
              disabled={!canAdvance(task.status)}
              data-testid="btn-advance"
              className="flex items-center justify-center w-8 h-8 rounded-full text-order-gold hover:text-order-light hover:bg-order-gold/15 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer text-xs border border-transparent hover:border-order-gold/30"
              aria-label="Advance task"
              title="Advance"
            >
              ▶
            </button>
          </div>

          {/* Edit / Delete */}
          <div className="flex items-center gap-1">
            <button
              onClick={edit}
              data-testid="btn-edit"
              className="flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all cursor-pointer text-sm border border-transparent hover:border-border/50"
              aria-label="Edit task"
              title="Edit"
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              data-testid="btn-delete"
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer text-xs
                ${confirmDelete
                  ? 'bg-red-500 text-white scale-110 border border-red-400'
                  : 'text-chaos-red/40 hover:text-chaos-red hover:bg-red-500/15 border border-transparent hover:border-chaos-red/30'
                }`}
              aria-label={confirmDelete ? 'Confirm delete' : 'Delete task'}
              title={confirmDelete ? 'Click again to confirm' : 'Delete'}
            >
              {confirmDelete ? '!' : '✕'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
