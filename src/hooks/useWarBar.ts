import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { computeWarState } from '../utils/warMath'
import { type WarState } from '../types'

export function useWarBar(): WarState {
  const { state } = useAppContext()
  return useMemo(() => computeWarState(state.tasks), [state.tasks])
}
