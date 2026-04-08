import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { AppProvider, useAppContext } from './context/AppContext'
import WarBar from './components/WarBar/WarBar'
import StatsPanel from './components/StatsPanel/StatsPanel'
import TaskBoard from './components/TaskBoard/TaskBoard'
import TaskModal from './components/TaskModal/TaskModal'
import HelpModal from './components/shared/HelpModal'
import CampaignChronicle from './components/Chronicle/CampaignChronicle'
import { ToastContainer } from './components/shared/Toast'
import EmpireCrest from './components/shared/EmpireCrest'
import WarpstormLayer from './components/Warpstorm/WarpstormLayer'
import ChaosManifest from './components/Warpstorm/ChaosManifest'
import OrderAscendant from './components/Warpstorm/OrderAscendant'
import { TaskStatus } from './types'
import robeUrl from '../assets/robe.svg'
import { useGameEvents } from './hooks/useGameEvents'
import GameEventBanner from './components/Events/GameEventBanner'

interface ToastItem { id: string; message: string; type: 'order' | 'chaos' | 'neutral' }

function AppInner() {
  const { state, dispatch, exportData, importData } = useAppContext()
  const importRef = useRef<HTMLInputElement>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [chronicleOpen, setChronicleOpen] = useState(false)
  const gameEvents = useGameEvents(state)
  const keyBuffer = useRef('')
  const lockedRef = useRef(state.locked) as MutableRefObject<boolean>

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'neutral') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Keep lockedRef in sync so keyboard handler never has stale closure
  useEffect(() => { lockedRef.current = state.locked }, [state.locked])

  // Global keyboard shortcuts + secret keyword detector
  useEffect(() => {
    const SECRET = 'sigmar'
    function handler(e: KeyboardEvent) {
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return

      // Secret keyword: type "sigmar" anywhere to toggle lock
      if (e.key.length === 1) {
        keyBuffer.current = (keyBuffer.current + e.key.toLowerCase()).slice(-SECRET.length)
        if (keyBuffer.current === SECRET) {
          keyBuffer.current = ''
          dispatch({ type: 'TOGGLE_LOCK' })
          addToast(
            lockedRef.current
              ? '⚔ The seal is lifted. The war board awaits your command.'
              : 'ᚱ The war board is sealed by Sigmar\'s will.',
            lockedRef.current ? 'order' : 'neutral',
          )
          return
        }
      }

      if (e.key === 'n' || e.key === 'N') {
        if (lockedRef.current) return
        e.preventDefault()
        dispatch({ type: 'OPEN_MODAL', payload: { mode: 'add', defaultStatus: TaskStatus.Backlog } })
      }
      if (e.key === '?') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_HELP' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch, addToast])

  return (
    <div className="max-w-6xl mx-auto min-h-screen">
      {/* ── Warpstorm system ── */}
      <WarpstormLayer />
      <ChaosManifest />
      <OrderAscendant />

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 border-b border-border/40"
        style={{
          background: 'rgba(12,10,7,0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 rgba(242,201,76,0.08), 0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="px-6 py-3.5">
          <div className="flex items-center justify-between gap-4">

            {/* Brand */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #201808, #3A2A0E)',
                    boxShadow: '0 2px 12px rgba(242,201,76,0.2), inset 0 1px 0 rgba(242,201,76,0.15)',
                    border: '1px solid rgba(242,201,76,0.2)',
                  }}
                >
                  <EmpireCrest size={26} />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[6px]"
                  style={{ background: '#0E0C08', borderColor: 'rgba(242,201,76,0.3)' }}
                >
                  ⚔
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-cinzel font-black text-base text-order-gold tracking-widest uppercase leading-none">
                  War With Chaos
                </h1>
                <p className="font-body text-text-muted text-[10px] mt-0.5 hidden sm:block truncate tracking-wide">
                  Every task is a blow against the Dark Gods
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { mode: 'add', defaultStatus: TaskStatus.Backlog } })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-cinzel text-xs tracking-wide transition-all cursor-pointer active:scale-95 font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #B8922A, #F2C94C)',
                  color: '#1A1200',
                  boxShadow: '0 2px 12px rgba(242,201,76,0.3)',
                }}
                title="New task (N)"
              >
                <span className="text-sm font-bold">+</span> New Order
              </button>

              <div className="flex items-center gap-1 bg-surface-elevated rounded-full px-1 py-1" style={{ border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setChronicleOpen(o => !o)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer
                    ${chronicleOpen ? 'bg-order-gold/20' : 'hover:bg-surface-card'}`}
                  title="Campaign Chronicle"
                >
                  <img
                    src={robeUrl}
                    alt="Chronicle"
                    className="w-4 h-4"
                    style={{ opacity: chronicleOpen ? 0.9 : 0.45 }}
                  />
                </button>
                <button
                  onClick={exportData}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-card transition-all cursor-pointer text-sm"
                  title="Export backup"
                >
                  ↓
                </button>
                <button
                  onClick={() => importRef.current?.click()}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-card transition-all cursor-pointer text-sm"
                  title="Import backup"
                >
                  ↑
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_HELP' })}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-card transition-all cursor-pointer text-xs font-bold"
                  title="Keyboard shortcuts (?)"
                >
                  ?
                </button>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) {
              importData(file)
              addToast('War records restored from backup.', 'order')
            }
            e.target.value = ''
          }}
        />
      </header>

      {/* ── War status section ── */}
      <div className="pt-2">
        <WarBar />
        <StatsPanel />
      </div>

      {/* ── Battle board label ── */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="font-cinzel text-xs text-text-muted tracking-widest uppercase px-2">Battle Orders</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      <TaskBoard />

      {/* Campaign Chronicle */}
      <CampaignChronicle isOpen={chronicleOpen} onClose={() => setChronicleOpen(false)} />

      {/* Modals */}
      <TaskModal />
      <HelpModal />

      {/* Game event banners */}
      {gameEvents.events.length > 0 && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3"
          style={{ width: 'min(480px, calc(100vw - 48px))' }}
        >
          {gameEvents.events.map(evt => (
            <GameEventBanner key={evt.id} event={evt} onDismiss={gameEvents.dismiss} />
          ))}
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
