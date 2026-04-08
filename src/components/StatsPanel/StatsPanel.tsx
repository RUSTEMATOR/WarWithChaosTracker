import { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useWarBar } from '../../hooks/useWarBar'
import { TaskStatus } from '../../types'
import { ACHIEVEMENTS, STREAK_TITLES } from '../../utils/constants'
import FlavorText from './FlavorText'
import cryoChamberUrl from '../../../assets/cryo-chamber.svg'
import warlordHelmetUrl from '../../../assets/warlord-helmet.svg'
import emperorCardUrl from '../../../assets/tarot-04-the-emperor.svg'
import hierophantCardUrl from '../../../assets/tarot-05-the-hierophant.svg'
import plaguekingUrl from '../../../assets/PlaugeKing.png'

const PHASE_LABELS: Record<string, { text: string; color: string; bg: string; dot: string; border: string }> = {
  neutral:       { text: 'Awaiting Orders',  color: 'text-text-secondary',  bg: 'bg-surface-elevated',   dot: 'bg-zinc-500',    border: 'border-zinc-700/40'     },
  balanced:      { text: 'The Lines Hold',   color: 'text-yellow-300',      bg: 'bg-yellow-500/10',      dot: 'bg-yellow-400',  border: 'border-yellow-600/30'   },
  order_winning: { text: 'Empire Advances',  color: 'text-order-gold',      bg: 'bg-order-gold/10',      dot: 'bg-order-gold',  border: 'border-order-gold/30'   },
  chaos_winning: { text: 'Chaos Threatens',  color: 'text-red-400',         bg: 'bg-red-500/10',         dot: 'bg-red-500',     border: 'border-red-700/30'      },
  order_victory: { text: 'Total Victory',    color: 'text-order-gold',      bg: 'bg-order-gold/15',      dot: 'bg-green-400',   border: 'border-order-gold/40'   },
  chaos_victory: { text: 'Realm in Ruins',   color: 'text-red-400',         bg: 'bg-red-500/15',         dot: 'bg-red-500',     border: 'border-red-700/40'      },
}

const STAT_CARDS = [
  {
    key: 'backlog',
    label: 'Backlog',
    sublabel: 'awaiting orders',
    iconSrc: cryoChamberUrl,
    iconBg: 'background: rgba(239,68,68,0.12)',
    numColor: 'text-red-400',
    border: 'border-red-900/30',
    accent: 'from-red-600/20 to-transparent',
  },
  {
    key: 'active',
    label: 'In Battle',
    sublabel: 'on the front',
    iconSrc: warlordHelmetUrl,
    iconBg: 'background: rgba(242,201,76,0.12)',
    numColor: 'text-order-gold',
    border: 'border-yellow-900/30',
    accent: 'from-yellow-600/20 to-transparent',
  },
  {
    key: 'done',
    label: 'Victorious',
    sublabel: 'tasks complete',
    iconSrc: emperorCardUrl,
    iconBg: 'background: rgba(74,222,128,0.10)',
    numColor: 'text-green-400',
    border: 'border-green-900/30',
    accent: 'from-green-600/15 to-transparent',
  },
  {
    key: 'alltime',
    label: 'All-Time',
    sublabel: 'legendary deeds',
    iconSrc: hierophantCardUrl,
    iconBg: 'background: rgba(168,85,247,0.12)',
    numColor: 'text-purple-400',
    border: 'border-purple-900/30',
    accent: 'from-purple-600/15 to-transparent',
  },
]

function getStreakTitle(days: number): string | null {
  for (let i = STREAK_TITLES.length - 1; i >= 0; i--) {
    if (days >= STREAK_TITLES[i].days) return STREAK_TITLES[i].title
  }
  return null
}

function getAchievementById(id: string) {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export default function StatsPanel() {
  const { state, dispatch } = useAppContext()
  const war = useWarBar()

  const backlogCount = state.tasks.filter(t => t.status === TaskStatus.Backlog).length
  const inProgressCount = state.tasks.filter(t => t.status === TaskStatus.InProgress).length
  const flavorSeed = state.allTimeDoneCount + state.tasks.length
  const phase = PHASE_LABELS[war.phase]
  const streakTitle = getStreakTitle(state.streak.currentStreak)

  const pendingAch = state.pendingAchievement ? getAchievementById(state.pendingAchievement) : null

  useEffect(() => {
    if (!pendingAch) return
    const t = setTimeout(() => dispatch({ type: 'CLEAR_ACHIEVEMENT' }), 5000)
    return () => clearTimeout(t)
  }, [pendingAch, dispatch])

  const statValues: Record<string, number> = {
    backlog: backlogCount,
    active: inProgressCount,
    done: war.doneTasks,
    alltime: state.allTimeDoneCount,
  }

  return (
    <div
      className="mx-6 mb-5 rounded-3xl border border-border/50 overflow-hidden relative"
      style={{ background: 'var(--surface-section)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
    >
      {/* Plague King looms when Chaos is winning */}
      {(war.phase === 'chaos_victory' || war.phase === 'chaos_winning') && (
        <img
          src={plaguekingUrl}
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 right-0 pointer-events-none select-none"
          style={{
            height: '130px',
            opacity: war.phase === 'chaos_victory' ? 0.18 : 0.1,
            maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
          }}
        />
      )}
      {/* Achievement banner */}
      {pendingAch && (
        <div className="px-5 pt-4 pb-0 animate-fade-in">
          <div
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-order-gold/35"
            style={{ background: 'rgba(242,201,76,0.07)' }}
          >
            <span className="text-2xl">⚜</span>
            <div>
              <p className="font-cinzel font-bold text-order-gold text-sm tracking-wide">{pendingAch.title}</p>
              <p className="text-text-secondary text-xs font-body italic mt-0.5">{pendingAch.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 pb-5">
        {/* Phase badge + streak row */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <span
            data-testid="phase-badge"
            className={`inline-flex items-center gap-2 font-cinzel text-[11px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border ${phase.color} ${phase.bg} ${phase.border}`}
          >
            <span className={`w-2 h-2 rounded-full ${phase.dot}`} />
            {phase.text}
          </span>

          {state.streak.currentStreak > 0 && (
            <span
              className="inline-flex items-center gap-1.5 font-body text-xs text-order-gold/80 px-4 py-2 rounded-full border border-order-gold/20"
              style={{ background: 'rgba(242,201,76,0.07)' }}
            >
              🔥 <span className="font-semibold">{state.streak.currentStreak}-Day Streak</span>
              {streakTitle && <span className="text-order-gold/50 ml-1">· {streakTitle}</span>}
            </span>
          )}
        </div>

        {/* Stat cards — Monday.com style big numbers */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {STAT_CARDS.map(card => {
            const val = statValues[card.key]
            return (
              <div
                key={card.key}
                className={`relative flex flex-col gap-1 rounded-2xl p-4 border overflow-hidden ${card.border}`}
                style={{ background: 'var(--surface-card)' }}
              >
                {/* Top accent gradient */}
                <div className={`absolute top-0 left-0 right-0 h-16 bg-gradient-to-b ${card.accent} pointer-events-none`} />

                {/* Icon chip */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 relative"
                  style={{ background: card.iconBg.replace('background: ', '') }}
                >
                  <img src={card.iconSrc} alt={card.label} className="w-5 h-5 opacity-80" />
                </div>

                {/* Big number */}
                <div className={`font-cinzel font-black text-3xl leading-none stat-number ${card.numColor}`}>
                  {val}
                </div>

                {/* Labels */}
                <div className="mt-1">
                  <div className="font-cinzel font-semibold text-[11px] text-text-primary tracking-wide uppercase leading-none">
                    {card.label}
                  </div>
                  <div className="font-body text-[10px] text-text-muted mt-0.5">
                    {card.sublabel}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Flavor text */}
        <div
          className="rounded-2xl px-4 py-3 border border-border/30"
          style={{ background: 'var(--surface-card)' }}
        >
          <FlavorText phase={war.phase} seed={flavorSeed} />
        </div>
      </div>
    </div>
  )
}
