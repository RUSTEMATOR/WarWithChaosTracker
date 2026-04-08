import { useMemo } from 'react'
import { useWarBar } from '../../hooks/useWarBar'

// Elder Futhark runes — used in Warhammer Chaos aesthetics
const RUNES = ['ᚱ','ᚨ','ᚦ','ᚷ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛋ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ','ᚲ','ᚹ','ᛂ','ᛝ']

// Deterministic LCG — same layout every render, no flicker
function seededRand(seed: number) {
  let s = seed
  return () => {
    s = Math.imul(1664525, s) + 1013904223 | 0
    return (s >>> 0) / 0xffffffff
  }
}

interface Particle {
  id: number
  rune: string
  left: number
  delay: number
  duration: number
  size: number
  baseOpacity: number
  isPurple: boolean
}

export default function WarpstormLayer() {
  const war = useWarBar()

  // Scale from 0 (chaos at 30%) to 1 (chaos at 85%+)
  const intensity = Math.max(0, Math.min(1, (war.chaosPercent - 30) / 55))

  const particles = useMemo<Particle[]>(() => {
    const rand = seededRand(0xDEADBEEF)
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      rune: RUNES[Math.floor(rand() * RUNES.length)],
      left: rand() * 100,
      delay: rand() * 12,
      duration: 7 + rand() * 11,
      size: 11 + rand() * 22,
      baseOpacity: 0.12 + rand() * 0.38,
      isPurple: rand() > 0.6,
    }))
  }, [])

  if (intensity <= 0) return null

  const vignetteAlpha = 0.22 * intensity

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Corruption vignette — blood bleeds in from screen edges */}
      <div
        className="chaos-vignette absolute inset-0"
        style={{
          boxShadow: [
            `inset 0 0 ${160 * intensity}px ${80 * intensity}px rgba(139,0,0,${vignetteAlpha})`,
            `inset 0 0 ${80 * intensity}px ${30 * intensity}px rgba(100,0,120,${vignetteAlpha * 0.6})`,
          ].join(', '),
        }}
      />

      {/* Floating runes */}
      {particles.map(p => (
        <div
          key={p.id}
          className="warpstorm-rune"
          style={{
            left: `${p.left}%`,
            bottom: '-80px',
            fontSize: `${p.size}px`,
            color: p.isPurple ? '#A855F7' : '#EF4444',
            opacity: p.baseOpacity * intensity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.rune}
        </div>
      ))}
    </div>
  )
}
