import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const RUNES = ['ᚱ','ᚨ','ᚦ','ᚷ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛋ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

function lcg(seed: number) {
  let s = seed | 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0
    return (s >>> 0) / 0xffffffff
  }
}

export type CorruptionLevel = 0 | 1 | 2 | 3

/**
 * Returns text with chaos runes replacing some characters.
 * Level 0–1: plain text. Level 2–3: animated rune substitution.
 */
export function useCorruptedText(text: string, level: CorruptionLevel): ReactNode {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (level < 2) return
    const ms = level === 3 ? 650 : 1300
    const id = setInterval(() => setTick(n => (n + 1) & 0xffff), ms)
    return () => clearInterval(id)
  }, [level])

  if (level < 2) return text

  const seed = (tick * 0x9e3779b9) ^ (text.charCodeAt(0) | 0) ^ ((text.charCodeAt(text.length >> 1) | 0) << 8)
  const rand = lcg(seed)
  const chars = text.split('')

  const nonSpace = chars.filter(c => c !== ' ').length
  const count = level === 3
    ? Math.max(2, Math.floor(nonSpace * 0.35))
    : Math.max(1, Math.floor(nonSpace * 0.18))

  // Pick positions + runes in one pass to keep rand() deterministic
  const corruptData = new Map<number, string>()
  let attempts = 0
  while (corruptData.size < count && attempts < chars.length * 4) {
    const idx = Math.floor(rand() * chars.length)
    if (chars[idx] !== ' ' && !corruptData.has(idx)) {
      corruptData.set(idx, RUNES[Math.floor(rand() * RUNES.length)])
    }
    attempts++
  }

  return chars.map((ch, i) =>
    corruptData.has(i)
      ? <span key={i} className={`chaos-char${level === 3 ? ' chaos-char--severe' : ''}`}>{corruptData.get(i)}</span>
      : ch
  )
}
