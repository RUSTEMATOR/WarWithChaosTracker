import { useEffect, useState } from 'react'
import { type WarPhase } from '../../types'
import { useFlavorText } from '../../hooks/useFlavorText'

interface Props {
  phase: WarPhase
  seed: number
}

export default function FlavorText({ phase, seed }: Props) {
  const text = useFlavorText(phase, seed)
  const [visible, setVisible] = useState(true)
  const [currentText, setCurrentText] = useState(text)

  useEffect(() => {
    if (text === currentText) return
    setVisible(false)
    const timer = setTimeout(() => {
      setCurrentText(text)
      setVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [text, currentText])

  return (
    <p
      data-testid="flavor-text"
      className="flavor-text text-center text-sm font-body italic text-ink-dim px-4"
      style={{ opacity: visible ? 1 : 0 }}
      aria-live="polite"
    >
      "{currentText}"
    </p>
  )
}
