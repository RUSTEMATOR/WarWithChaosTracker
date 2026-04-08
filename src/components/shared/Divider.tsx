interface Props {
  label?: string
}

export default function Divider({ label }: Props) {
  if (label) {
    return (
      <div className="ornament-divider my-3">
        <span className="font-cinzel text-xs text-order-gold/60 tracking-widest uppercase whitespace-nowrap">
          ✦ {label} ✦
        </span>
      </div>
    )
  }
  return <div className="ornament-divider my-3" />
}
