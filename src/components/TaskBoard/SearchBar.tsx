import { useAppContext } from '../../context/AppContext'
import spyglassUrl from '../../../assets/spyglass.svg'

export default function SearchBar() {
  const { state, dispatch } = useAppContext()

  return (
    <div className="px-5 pb-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          <img src={spyglassUrl} alt="" className="w-4 h-4 opacity-40" />
        </span>
        <input
          type="search"
          value={state.searchQuery}
          onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          placeholder="Search orders..."
          className="w-full bg-surface-card border border-border/70 rounded-xl pl-10 pr-10 py-2.5
            text-text-primary text-sm font-body placeholder-text-muted
            focus:outline-none focus:border-order-gold/60 focus:shadow-glow-gold
            transition-all duration-200"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        />
        {state.searchQuery && (
          <button
            onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface-elevated cursor-pointer text-xs transition-all"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
