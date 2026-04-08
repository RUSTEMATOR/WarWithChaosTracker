import { type WarPhase } from '../../types'

interface Props {
  phase: WarPhase
}

export default function VictoryBanner({ phase }: Props) {
  if (phase === 'order_victory') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <span
          className="victory-text font-cinzel font-black text-sm tracking-widest text-order-gold uppercase"
        >
          ✦ Empire Victorious ✦
        </span>
      </div>
    )
  }
  if (phase === 'chaos_victory') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <span
          className="victory-text font-cinzel font-black text-sm tracking-widest text-chaos-red uppercase"
        >
          ✦ Chaos Reigns Eternal ✦
        </span>
      </div>
    )
  }
  return null
}
