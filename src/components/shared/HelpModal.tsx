import { useAppContext } from '../../context/AppContext'
import Modal from './Modal'

const shortcuts = [
  { keys: 'N', action: 'New task (Backlog)' },
  { keys: 'Ctrl+Z', action: 'Undo last action' },
  { keys: '?', action: 'Show / hide this guide' },
  { keys: 'Esc', action: 'Close modal' },
  { keys: 'sigmar', action: 'Toggle war board lock (secret)' },
]

export default function HelpModal() {
  const { state, dispatch } = useAppContext()

  return (
    <Modal
      isOpen={state.helpOpen}
      onClose={() => dispatch({ type: 'TOGGLE_HELP' })}
      title="War Council — Commands"
    >
      <dl className="space-y-2">
        {shortcuts.map(s => (
          <div key={s.keys} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
            <kbd className="font-cinzel text-xs px-2 py-0.5 rounded border border-order-gold/30 bg-order-gold/10 text-order-gold tracking-wide">
              {s.keys}
            </kbd>
            <span className="text-text-secondary text-sm font-body">{s.action}</span>
          </div>
        ))}
      </dl>
      <p className="text-text-muted text-xs font-body italic mt-4 text-center">
        Shortcuts are disabled while typing in a field.
      </p>
    </Modal>
  )
}
