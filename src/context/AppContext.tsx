import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react'
import { type AppState, type AppAction, type Task } from '../types'
import { appReducer, initialState } from './appReducer'
import { STORAGE_KEY, SCHEMA_VERSION } from '../utils/constants'
import { SEED_TASKS } from '../utils/seedData'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  exportData: () => void
  importData: (file: File) => void
}

const AppContext = createContext<AppContextValue | null>(null)

// Migrate saved data from older schema versions
function migrate(saved: Record<string, unknown>): Partial<Pick<AppState, 'tasks' | 'allTimeDoneCount' | 'streak'>> {
  const version = (saved.version as number | undefined) ?? 1
  let tasks = (saved.tasks as Task[] | undefined) ?? []
  const allTimeDoneCount = (saved.allTimeDoneCount as number | undefined) ?? 0
  const streak = (saved.streak as AppState['streak'] | undefined) ?? { currentStreak: 0, lastCompletionDate: null }

  if (version < 2) {
    // v1 → v2: add dueAt field (already optional, no action needed for existing tasks)
    tasks = tasks.map(t => ({ ...t, dueAt: t.dueAt ?? undefined }))
  }

  return { tasks, allTimeDoneCount, streak }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const initialized = useRef(false)

  // Expose dispatch on window in dev mode so Playwright tests can reset state directly
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__wwc_dispatch = dispatch
    }
    return () => {
      if (import.meta.env.DEV) {
        delete (window as unknown as Record<string, unknown>).__wwc_dispatch
      }
    }
  }, [dispatch])

  // Load from localStorage on mount; seed on first run
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>
        dispatch({ type: 'LOAD_STATE', payload: migrate(saved) })
      } else {
        dispatch({ type: 'LOAD_STATE', payload: { tasks: SEED_TASKS, allTimeDoneCount: 0 } })
      }
    } catch {
      // Corrupt storage — seed fresh
      dispatch({ type: 'LOAD_STATE', payload: { tasks: SEED_TASKS, allTimeDoneCount: 0 } })
    }
  }, [])

  // Persist on every relevant state change
  useEffect(() => {
    if (!initialized.current) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: SCHEMA_VERSION,
          tasks: state.tasks,
          allTimeDoneCount: state.allTimeDoneCount,
          streak: state.streak,
        })
      )
    } catch {
      // Storage full — silent fail
    }
  }, [state.tasks, state.allTimeDoneCount, state.streak])

  // Global undo shortcut (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const active = document.activeElement
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
        e.preventDefault()
        dispatch({ type: 'UNDO' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function exportData() {
    const data = JSON.stringify(
      { version: SCHEMA_VERSION, tasks: state.tasks, allTimeDoneCount: state.allTimeDoneCount, streak: state.streak },
      null,
      2
    )
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `war-with-chaos-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as Record<string, unknown>
        if (!Array.isArray(parsed.tasks)) throw new Error('Invalid format')
        dispatch({ type: 'LOAD_STATE', payload: migrate(parsed) })
      } catch {
        alert('Invalid backup file. The war records could not be restored.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <AppContext.Provider value={{ state, dispatch, exportData, importData }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
