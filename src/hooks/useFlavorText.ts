import { useMemo } from 'react'
import { type WarPhase } from '../types'
import { FLAVOR_TEXTS } from '../utils/constants'

// seed is allTimeDoneCount + tasks.length — monotonically increases with activity
export function useFlavorText(phase: WarPhase, seed: number): string {
  return useMemo(() => {
    const texts = FLAVOR_TEXTS[phase]
    return texts[seed % texts.length]
  }, [phase, seed])
}
