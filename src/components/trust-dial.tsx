import { cn } from '@/utils/cn'

interface TrustDialProps {
  score: number
}

export function TrustDial({ score }: TrustDialProps) {
  const clamped = Math.max(0, Math.min(100, score))

  const level =
    clamped >= 80 ? 'safe' : clamped >= 40 ? 'caution' : 'danger'

  const color = {
    safe: '#16a34a',
    caution: '#d97706',
    danger: '#dc2626',
  }[level]

  const label = {
    safe: 'Safe',
    caution: 'Caution',
    danger: 'High Risk',
  }[level]

  const bg = {
    safe: 'bg-green-50 border-green-200',
    caution: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
  }[level]

  // SVG arc calculation
  const radius = 54
  const circumference = Math.PI * radius // semicircle
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center rounded-2xl border p-6', bg)}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Background arc */}
        <path
          d="M 14 70 A 56 56 0 0 1 126 70"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d="M 14 70 A 56 56 0 0 1 126 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score number */}
        <text
          x="70"
          y="62"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill={color}
        >
          {clamped}
        </text>
      </svg>

      <span
        className="mt-1 rounded-full px-3 py-1 text-sm font-semibold"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {label}
      </span>
    </div>
  )
}