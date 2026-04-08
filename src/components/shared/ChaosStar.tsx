interface Props {
  size?: number
  className?: string
}

export default function ChaosStar({ size = 32, className = '' }: Props) {
  // 8-pointed star of chaos
  const points: string[] = []
  const innerPoints: string[] = []
  const cx = 32, cy = 32
  const outerR = 28, innerR = 11, arrowR = 32

  for (let i = 0; i < 8; i++) {
    const outerAngle = (i * 45 - 90) * (Math.PI / 180)
    const innerAngle = ((i * 45 + 22.5) - 90) * (Math.PI / 180)
    points.push(`${cx + outerR * Math.cos(outerAngle)},${cy + outerR * Math.sin(outerAngle)}`)
    innerPoints.push(`${cx + innerR * Math.cos(innerAngle)},${cy + innerR * Math.sin(innerAngle)}`)
  }

  // Interleave outer and inner points for star polygon
  const starPoints = points.flatMap((p, i) => [p, innerPoints[i]]).join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 8-pointed star body */}
      <polygon
        points={starPoints}
        fill="#DC2626"
        fillOpacity="0.85"
        stroke="#EF4444"
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />

      {/* Arrow tips on each point */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180)
        const tx = cx + arrowR * Math.cos(angle)
        const ty = cy + arrowR * Math.sin(angle)
        const tipAngle = angle
        const aw = 3
        const lx = tx + aw * Math.cos(tipAngle + Math.PI / 2)
        const ly = ty + aw * Math.sin(tipAngle + Math.PI / 2)
        const rx2 = tx + aw * Math.cos(tipAngle - Math.PI / 2)
        const ry2 = ty + aw * Math.sin(tipAngle - Math.PI / 2)
        const apx = cx + (arrowR + 4) * Math.cos(tipAngle)
        const apy = cy + (arrowR + 4) * Math.sin(tipAngle)
        return (
          <polygon
            key={i}
            points={`${lx},${ly} ${rx2},${ry2} ${apx},${apy}`}
            fill="#EF4444"
            fillOpacity="0.9"
          />
        )
      })}

      {/* Center eye */}
      <circle cx="32" cy="32" r="5" fill="#7F1D1D" />
      <circle cx="32" cy="32" r="2.5" fill="#EF4444" fillOpacity="0.8" />
    </svg>
  )
}
