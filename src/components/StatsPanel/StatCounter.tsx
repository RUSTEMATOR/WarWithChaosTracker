import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  label: string
  color?: string
}

export default function StatCounter({ value, label, color = 'text-text-primary' }: Props) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    prevRef.current = value

    if (start === end) return

    const duration = 400
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return (
    <div className="text-center" data-testid={`stat-${label.toLowerCase()}`}>
      <div className={`font-cinzel font-black text-2xl leading-none ${color}`} data-testid="stat-value">
        {displayed}
      </div>
      <div className="font-body text-[10px] text-text-muted tracking-widest uppercase mt-1">{label}</div>
    </div>
  )
}
