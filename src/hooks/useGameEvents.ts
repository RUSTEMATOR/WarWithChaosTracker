import { useEffect, useRef, useState } from 'react'
import { type AppState, TaskStatus } from '../types'
import goblinUrl from '../../assets/goblin.svg'
import robotGolemUrl from '../../assets/robot-golem.svg'
import mouthWateringUrl from '../../assets/mouth-watering.svg'

export interface GameEventNotice {
  id: string
  type: 'orc_assault' | 'titan_deployed' | 'slaanesh_temptation'
  title: string
  message: string
  iconUrl: string
  accent: string
  accentBg: string
}

const ORC_MESSAGES = [
  "The Waaagh! surges from the Badlands. Your backlog draws the greenskins like iron to lodestone.",
  "Skarsnik's wolves circle the walls. Every unfinished task is a banner in their horde.",
  "Da boyz are massing at the border. The Empire's generals call for reinforcements.",
  "Green tide rising. The backlog festers like an open wound in the Empire's defences.",
]

const TITAN_MESSAGES = [
  "The engineers ignite the furnaces. A Steam Titan strides to war for the Empire!",
  "Gears grind, pistons hammer. The great machine answers the call of duty.",
  "Iron and fire — the Mechanists' finest creation answers your victories with thunder.",
  "Three tasks felled. The Steam Titan marches upon the forces of darkness!",
  "The boilers roar. Your momentum forges a war machine from sheer will.",
]

const SLAANESH_MESSAGES = [
  "The Prince of Pleasure savours your procrastination. Overdue tasks are his tribute.",
  "Sweet delay... Slaanesh drinks deep from your indolence. Act before all is forfeit.",
  "Perfection can wait, whispers the Dark Prince. Do not listen. Do not yield.",
  "Your deadlines wither on the vine. The Architect of Desire feasts on this... lapse.",
]

const COOLDOWN_MS = 90_000 // 90s per event type

export function useGameEvents(state: AppState) {
  const [events, setEvents] = useState<GameEventNotice[]>([])

  const lastFired = useRef<Partial<Record<GameEventNotice['type'], number>>>({})
  const prevBacklogCount  = useRef<number | null>(null)
  const prevOverdueCount  = useRef<number | null>(null)
  const initialDoneCount  = useRef(state.allTimeDoneCount)
  const prevSessionDone   = useRef(0)

  function canFire(type: GameEventNotice['type']) {
    const last = lastFired.current[type] ?? 0
    return Date.now() - last > COOLDOWN_MS
  }

  function fire(event: Omit<GameEventNotice, 'id'>) {
    lastFired.current[event.type] = Date.now()
    setEvents(prev => {
      const trimmed = prev.slice(-1) // keep at most 1 in queue
      return [...trimmed, { ...event, id: crypto.randomUUID() }]
    })
  }

  function dismiss(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  useEffect(() => {
    const now = Date.now()
    const backlogTasks  = state.tasks.filter(t => t.status === TaskStatus.Backlog)
    const backlogCount  = backlogTasks.length
    const overdueCount  = backlogTasks.filter(t => t.dueAt != null && t.dueAt < now).length
    const sessionDone   = state.allTimeDoneCount - initialDoneCount.current

    // ── Orc Assault ──────────────────────────────────────────────────────────
    // Fires when backlog jumps up by 2+ and is at least 5 total
    if (
      canFire('orc_assault') &&
      prevBacklogCount.current !== null &&
      backlogCount >= 5 &&
      backlogCount >= prevBacklogCount.current + 2
    ) {
      fire({
        type: 'orc_assault',
        title: 'Greenskin Waaagh!',
        message: ORC_MESSAGES[Math.floor(Math.random() * ORC_MESSAGES.length)],
        iconUrl: goblinUrl,
        accent: '#5a8c30',
        accentBg: 'rgba(90,140,48,0.12)',
      })
    }

    // ── Steam Titan ───────────────────────────────────────────────────────────
    // Fires on every 3rd task completed this session
    if (
      canFire('titan_deployed') &&
      sessionDone > 0 &&
      sessionDone % 3 === 0 &&
      sessionDone > prevSessionDone.current
    ) {
      fire({
        type: 'titan_deployed',
        title: 'Steam Titan Deployed!',
        message: TITAN_MESSAGES[Math.floor(Math.random() * TITAN_MESSAGES.length)],
        iconUrl: robotGolemUrl,
        accent: '#B8922A',
        accentBg: 'rgba(184,146,42,0.12)',
      })
    }

    // ── Slaanesh Stirs ────────────────────────────────────────────────────────
    // Fires when overdue count climbs to 2+ (on each new overdue task)
    if (
      canFire('slaanesh_temptation') &&
      prevOverdueCount.current !== null &&
      overdueCount >= 2 &&
      overdueCount > prevOverdueCount.current
    ) {
      fire({
        type: 'slaanesh_temptation',
        title: 'Slaanesh Stirs…',
        message: SLAANESH_MESSAGES[Math.floor(Math.random() * SLAANESH_MESSAGES.length)],
        iconUrl: mouthWateringUrl,
        accent: '#c026d3',
        accentBg: 'rgba(192,38,211,0.12)',
      })
    }

    prevBacklogCount.current = backlogCount
    prevOverdueCount.current = overdueCount
    prevSessionDone.current  = sessionDone
  }, [state.tasks, state.allTimeDoneCount])

  return { events, dismiss }
}
