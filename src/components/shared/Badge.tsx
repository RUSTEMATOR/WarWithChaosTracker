import { Priority } from '../../types'

interface Props {
  priority: Priority
  thematic?: boolean
}

const BADGE_STYLE: Record<Priority, { bg: string; text: string; dot: string; icon: string; label: string; thematicLabel: string }> = {
  [Priority.High]:   { bg: 'bg-red-500/20',    text: 'text-red-400',     dot: 'bg-red-400',    icon: '💀', label: 'High',   thematicLabel: 'Crusade'  },
  [Priority.Medium]: { bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  dot: 'bg-yellow-400', icon: '⚔⚔', label: 'Med',    thematicLabel: 'Campaign' },
  [Priority.Low]:    { bg: 'bg-zinc-500/20',    text: 'text-zinc-400',    dot: 'bg-zinc-400',   icon: '⚔',  label: 'Low',    thematicLabel: 'Skirmish' },
}

export default function Badge({ priority, thematic = false }: Props) {
  const s = BADGE_STYLE[priority]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium font-body ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      {thematic ? s.thematicLabel : s.label}
    </span>
  )
}
