import { useWarBar } from '../../hooks/useWarBar'
import { useAppContext } from '../../context/AppContext'
import { TaskStatus } from '../../types'
import ChaosStar from '../shared/ChaosStar'

interface ChaosGod {
  name: string
  title: string
  color: string
  shadowColor: string
  borderColor: string
  rune: string
  taunt: string
  subtext: string
}

const CHAOS_GODS: ChaosGod[] = [
  {
    name: 'KHORNE',
    title: 'The Blood God',
    color: '#DC2626',
    shadowColor: 'rgba(220,38,38,0.5)',
    borderColor: 'rgba(220,38,38,0.4)',
    rune: 'ᚱ',
    taunt: 'YOUR FAILURES FEED THE SKULL THRONE',
    subtext: 'Every unfinished task is a skull offered to the Blood God. BLOOD FOR BLOOD GOD.',
  },
  {
    name: 'TZEENTCH',
    title: 'The Changer of Ways',
    color: '#A855F7',
    shadowColor: 'rgba(168,85,247,0.5)',
    borderColor: 'rgba(168,85,247,0.4)',
    rune: 'ᛇ',
    taunt: 'JUST AS PLANNED, LITTLE MORTAL',
    subtext: 'Your procrastination was always part of the Great Scheme. Change is inevitable. Resistance is delightful.',
  },
  {
    name: 'NURGLE',
    title: 'Grandfather Plague',
    color: '#65A30D',
    shadowColor: 'rgba(101,163,13,0.5)',
    borderColor: 'rgba(101,163,13,0.4)',
    rune: 'ᛟ',
    taunt: 'ALL THINGS ROT IN THE END',
    subtext: "Do not despair, beloved. Grandfather Nurgle embraces all who decay. Your tasks fester beautifully.",
  },
  {
    name: 'SLAANESH',
    title: 'Prince of Excess',
    color: '#EC4899',
    shadowColor: 'rgba(236,72,153,0.5)',
    borderColor: 'rgba(236,72,153,0.4)',
    rune: 'ᛉ',
    taunt: 'SWEET SURRENDER',
    subtext: 'The pleasure of not completing things is exquisite torment. Give in to beautiful failure.',
  },
]

export default function ChaosManifest() {
  const war = useWarBar()
  const { dispatch } = useAppContext()

  if (war.phase !== 'chaos_victory') return null

  // Rotate gods by day
  const god = CHAOS_GODS[Math.floor(Date.now() / 86400000) % CHAOS_GODS.length]

  function resist() {
    dispatch({ type: 'OPEN_MODAL', payload: { mode: 'add', defaultStatus: TaskStatus.Backlog } })
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 chaos-manifest-enter"
      style={{ filter: 'drop-shadow(0 -8px 40px rgba(139,0,0,0.6))' }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(8,4,4,0.97) 0%, rgba(20,6,6,1) 100%)',
          borderTop: `2px solid ${god.borderColor}`,
          boxShadow: `0 -4px 60px ${god.shadowColor}, inset 0 1px 0 ${god.borderColor}`,
        }}
      >
        {/* Animated rune border strip */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${god.color}, transparent)`, opacity: 0.8 }}
        />

        {/* Floating background runes */}
        {['ᚱ','ᛟ','ᛇ','ᛉ','ᚦ','ᛏ','ᚷ','ᚾ','ᛚ','ᛞ'].map((r, i) => (
          <span
            key={i}
            className="absolute font-cinzel select-none pointer-events-none"
            style={{
              left: `${8 + i * 9.5}%`,
              top: `${15 + (i % 3) * 25}%`,
              fontSize: '18px',
              color: god.color,
              opacity: 0.06 + (i % 4) * 0.025,
              animation: `chaos-rune-border ${2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
            }}
          >
            {r}
          </span>
        ))}

        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-6">
            {/* Spinning Chaos Star */}
            <div className="shrink-0 relative">
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full"
                style={{
                  background: `radial-gradient(circle, ${god.color}22 0%, transparent 70%)`,
                  border: `1px solid ${god.borderColor}`,
                }}
              >
                <div style={{ animation: 'chaos-spin 8s linear infinite' }}>
                  <ChaosStar size={44} />
                </div>
              </div>
              {/* Pulsing ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${god.color}`,
                  animation: 'vignette-pulse 2s ease-in-out infinite',
                  transform: 'scale(1.15)',
                }}
              />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <span
                  className="font-cinzel font-black text-xl tracking-widest god-name-glow"
                  style={{ color: god.color }}
                >
                  {god.name}
                </span>
                <span className="font-cinzel text-xs tracking-widest text-text-muted uppercase">
                  {god.rune} {god.title}
                </span>
              </div>
              <p
                className="font-cinzel font-bold text-sm tracking-widest uppercase mb-1.5"
                style={{ color: god.color, opacity: 0.9 }}
              >
                {god.taunt}
              </p>
              <p className="font-body text-xs text-text-muted leading-relaxed max-w-lg">
                {god.subtext}
              </p>
            </div>

            {/* Resist button */}
            <div className="shrink-0">
              <button
                onClick={resist}
                className="font-cinzel font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-full transition-all cursor-pointer active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #B8922A, #F2C94C)',
                  color: '#1A1200',
                  boxShadow: '0 4px 20px rgba(242,201,76,0.4)',
                }}
              >
                ⚔ Resist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
