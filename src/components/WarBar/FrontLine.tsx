import { type WarPhase } from '../../types'

interface Props {
  position: number // 0–100 percent from left
  phase: WarPhase
}

// Small floating particles around the front line
function Particles() {
  const particles = [
    { delay: '0s', duration: '2.4s', color: '#C9A84C', left: '-6px' },
    { delay: '0.8s', duration: '3.1s', color: '#8B0000', left: '4px' },
    { delay: '1.5s', duration: '2.8s', color: '#C9A84C', left: '-2px' },
    { delay: '0.3s', duration: '3.5s', color: '#4A0E6B', left: '8px' },
  ]
  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            background: p.color,
            left: p.left,
            bottom: '100%',
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  )
}

// SVG sword icon for the front line marker
function SwordIcon({ phase }: { phase: WarPhase }) {
  const isOrderWinning = phase === 'order_victory' || phase === 'order_winning'
  const isChaosWinning = phase === 'chaos_victory' || phase === 'chaos_winning'
  const color = isOrderWinning ? '#C9A84C' : isChaosWinning ? '#cc1111' : '#E8D9B0'

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crossed swords icon */}
      <line x1="3" y1="3" x2="17" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="17" y1="3" x2="3" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="3" fill={color} opacity="0.8"/>
    </svg>
  )
}

export default function FrontLine({ position, phase }: Props) {
  return (
    <div
      className="war-bar-frontline absolute top-0 h-full z-10 flex items-center justify-center"
      style={{ left: `calc(${position}% - 1px)`, width: '2px' }}
    >
      {/* The glowing line */}
      <div className="absolute inset-0 bg-white opacity-90" />

      {/* Icon above */}
      <div className="absolute -top-7 -left-[9px]">
        <SwordIcon phase={phase} />
      </div>

      {/* Particles */}
      <Particles />
    </div>
  )
}
