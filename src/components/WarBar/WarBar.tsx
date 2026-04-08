import { useWarBar } from '../../hooks/useWarBar'
import FrontLine from './FrontLine'
import VictoryBanner from './VictoryBanner'
import EmpireCrest from '../shared/EmpireCrest'
import ChaosStar from '../shared/ChaosStar'

export default function WarBar() {
  const war = useWarBar()

  return (
    <div className="px-6 pt-5 pb-2">
      {/* Side labels */}
      <div className="flex justify-between items-center mb-3 gap-4">
        {/* Empire side */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(145deg, #1A1000, #2E2208)',
              border: '1px solid rgba(242,201,76,0.25)',
              boxShadow: '0 2px 12px rgba(242,201,76,0.1)',
            }}
          >
            <EmpireCrest size={28} />
          </div>
          <div className="min-w-0">
            <div className="font-cinzel font-bold text-order-gold text-sm tracking-widest uppercase leading-none">Empire</div>
            <div className="text-text-muted text-xs font-body mt-1">
              <span className="text-order-gold font-semibold text-base font-cinzel">{Math.round(war.orderPercent)}</span>
              <span className="text-text-muted text-[11px]">%</span>
              <span className="text-text-muted mx-1.5 text-[10px]">·</span>
              <span className="text-text-secondary text-[11px]">{war.doneTasks} {war.doneTasks === 1 ? 'victory' : 'victories'}</span>
            </div>
          </div>
        </div>

        {/* Center label */}
        <div className="text-center shrink-0">
          <div
            className="inline-flex flex-col items-center px-4 py-2 rounded-2xl"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="font-cinzel text-[9px] text-text-muted tracking-[0.2em] uppercase mb-0.5">Front Line</div>
            <div className="font-cinzel font-bold text-sm text-text-primary">
              {war.totalTasks > 0 ? `${war.doneTasks} / ${war.totalTasks}` : '—'}
            </div>
          </div>
        </div>

        {/* Chaos side */}
        <div className="flex items-center gap-3 text-right min-w-0 flex-row-reverse">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(145deg, #1A0000, #2E0808)',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 2px 12px rgba(239,68,68,0.1)',
            }}
          >
            <ChaosStar size={28} />
          </div>
          <div className="min-w-0">
            <div className="font-cinzel font-bold text-chaos-red text-sm tracking-widest uppercase leading-none">Chaos</div>
            <div className="text-text-muted text-xs font-body mt-1">
              <span className="text-chaos-red font-semibold text-base font-cinzel">{Math.round(war.chaosPercent)}</span>
              <span className="text-text-muted text-[11px]">%</span>
              <span className="text-text-muted mx-1.5 text-[10px]">·</span>
              <span className="text-text-secondary text-[11px]">{war.activeTasks} {war.activeTasks === 1 ? 'threat' : 'threats'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* The bar */}
      <div
        data-testid="war-bar"
        data-phase={war.phase}
        className="relative rounded-2xl overflow-visible border border-border/50"
        style={{
          height: '60px',
          background: '#080604',
          boxShadow: '0 6px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.5)',
        }}
      >
        {/* Order fill (left) */}
        <div
          data-testid="war-bar-order"
          className="war-bar-order absolute left-0 top-0 h-full rounded-l-2xl"
          style={{ width: `${war.orderPercent}%` }}
        />

        {/* Chaos fill (right) */}
        <div
          data-testid="war-bar-chaos"
          className="war-bar-chaos absolute right-0 top-0 h-full rounded-r-2xl"
          style={{ width: `${war.chaosPercent}%` }}
        />

        {/* Internal gloss line */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-2xl pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
        />

        {/* Front line marker */}
        {war.totalTasks > 0 && (
          <FrontLine position={war.orderPercent} phase={war.phase} />
        )}

        {/* Victory overlay */}
        <VictoryBanner phase={war.phase} />

        {/* Neutral state label */}
        {war.totalTasks === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl overflow-hidden">
            <span className="font-cinzel text-text-muted text-xs tracking-widest">
              — Add tasks to begin the war —
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
