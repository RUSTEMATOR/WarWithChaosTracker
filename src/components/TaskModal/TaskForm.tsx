import { useState, type FormEvent } from 'react'
import { Priority, TaskStatus } from '../../types'
import Button from '../shared/Button'
import thoughtBubbleUrl from '../../../assets/thought-bubble.svg'

interface FormValues {
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  dueAt?: number
}

interface Props {
  initialValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  submitLabel: string
}

const PRIORITY_OPTIONS = [
  { value: Priority.Low,    label: 'Skirmish',  icon: '⚔',  bg: 'hover:bg-zinc-500/15',   active: 'bg-zinc-500/25 border-zinc-400/60 text-zinc-300',   idle: 'border-border text-text-muted' },
  { value: Priority.Medium, label: 'Campaign',  icon: '⚔⚔', bg: 'hover:bg-yellow-500/15', active: 'bg-yellow-500/20 border-yellow-400/70 text-yellow-300', idle: 'border-border text-text-muted' },
  { value: Priority.High,   label: 'Crusade',   icon: '💀', bg: 'hover:bg-red-500/15',    active: 'bg-red-500/20 border-red-400/70 text-red-300',       idle: 'border-border text-text-muted' },
]

const STATUS_OPTIONS = [
  { value: TaskStatus.Backlog,    label: 'Backlog',      dot: 'bg-red-400'    },
  { value: TaskStatus.InProgress, label: 'In Progress',  dot: 'bg-yellow-400' },
  { value: TaskStatus.Done,       label: 'Done',         dot: 'bg-green-400'  },
]

function toDateInputValue(ts: number | undefined): string {
  if (!ts) return ''
  return new Date(ts).toISOString().slice(0, 10)
}

function fromDateInputValue(s: string): number | undefined {
  if (!s) return undefined
  return new Date(s + 'T00:00:00').getTime()
}

export default function TaskForm({ initialValues, onSubmit, onCancel, submitLabel }: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? Priority.Medium)
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? TaskStatus.Backlog)
  const [dueDate, setDueDate] = useState(toDateInputValue(initialValues?.dueAt))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueAt: fromDateInputValue(dueDate),
    })
  }

  const labelClass = 'block font-cinzel text-[11px] text-text-muted tracking-widest uppercase mb-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Name this battle..."
          className="plumpy-input"
          autoFocus
          required
        />
      </div>

      <div>
        <label className={`${labelClass} flex items-center gap-1.5`}>
          <img src={thoughtBubbleUrl} alt="" className="w-3 h-3 opacity-50" />
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Details of the engagement..."
          rows={3}
          className="plumpy-input resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className={labelClass}>Priority</label>
          <div className="flex flex-col gap-2">
            {PRIORITY_OPTIONS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`
                  flex items-center gap-2.5 px-3 py-2 text-xs font-body rounded-xl border transition-all duration-150 cursor-pointer
                  ${priority === p.value ? p.active : `${p.idle} ${p.bg}`}
                `}
              >
                <span className="text-sm">{p.icon}</span>
                <span className="font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Column</label>
          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={`
                  flex items-center gap-2.5 px-3 py-2 text-xs font-body rounded-xl border transition-all duration-150 cursor-pointer text-left
                  ${status === s.value
                    ? 'bg-order-gold/15 border-order-gold/60 text-order-gold'
                    : 'border-border text-text-muted hover:bg-surface-elevated hover:text-text-secondary'
                  }
                `}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
                <span className="font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Due date */}
      <div>
        <label className={labelClass}>Due Date <span className="normal-case text-text-muted/70 font-body tracking-normal">(optional)</span></label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="plumpy-input"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" variant="order" size="md" className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
