import { useMemo } from 'react'
import { useWarBar } from '../../hooks/useWarBar'
import EmpireCrest from '../shared/EmpireCrest'

interface Ray {
  id: number
  left: number
  width: number
  delay: number
  duration: number
  opacity: number
}

export default function OrderAscendant() {
  const war = useWarBar()

  if (war.phase !== 'order_victory') return null

  const rays = useMemo<Ray[]>(() => {
    // Deterministic layout
    const positions = [8, 18, 31, 42, 55, 63, 74, 85, 92]
    return positions.map((left, i) => ({
      id: i,
      left,
      width: 60 + (i * 37) % 200,
      delay: (i * 0.7) % 4,
      duration: 3 + (i * 0.5) % 2.5,
      opacity: 0.15 + (i % 4) * 0.08,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Golden rays raining down from top */}
      {rays.map(ray => (
        <div
          key={ray.id}
          className="order-ray"
          style={{
            left: `${ray.left}%`,
            width: `${ray.width}px`,
            top: '-4px',
            opacity: ray.opacity,
            animationDelay: `${ray.delay}s`,
            animationDuration: `${ray.duration}s`,
          }}
        />
      ))}

      {/* Radial golden halo from top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(242,201,76,0.12) 0%, transparent 70%)',
          animation: 'vignette-pulse 3s ease-in-out infinite',
        }}
      />

      {/* Blessing text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in">
        <div style={{ animation: 'chaos-spin 20s linear infinite' }}>
          <EmpireCrest size={48} />
        </div>
        <div
          className="font-cinzel font-black text-xs tracking-[0.3em] uppercase god-name-glow"
          style={{ color: '#F2C94C' }}
        >
          Sigmar Protects
        </div>
      </div>
    </div>
  )
}
