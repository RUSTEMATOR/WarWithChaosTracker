interface Props {
  size?: number
  className?: string
}

export default function EmpireCrest({ size = 32, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="32" cy="32" r="30" stroke="#F2C94C" strokeWidth="1.5" strokeOpacity="0.5" />

      {/* Cross shaft */}
      <rect x="29" y="8" width="6" height="48" rx="2" fill="#F2C94C" fillOpacity="0.9" />
      <rect x="8" y="29" width="48" height="6" rx="2" fill="#F2C94C" fillOpacity="0.9" />

      {/* Cross center diamond */}
      <rect x="32" y="32" width="8" height="8" rx="1" transform="rotate(-45 32 32)" fill="#FFE080" />

      {/* Corner fleur-de-lis style points */}
      <polygon points="32,4 29,10 35,10" fill="#F2C94C" fillOpacity="0.8" />
      <polygon points="32,60 29,54 35,54" fill="#F2C94C" fillOpacity="0.8" />
      <polygon points="4,32 10,29 10,35" fill="#F2C94C" fillOpacity="0.8" />
      <polygon points="60,32 54,29 54,35" fill="#F2C94C" fillOpacity="0.8" />
    </svg>
  )
}
