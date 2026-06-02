'use client'

import { useEffect, useState } from 'react'

interface TrustDialProps {
  score: number
  size?: 'sm' | 'md'
}

export function TrustDial({ score, size = 'md' }: TrustDialProps) {
  const [animated, setAnimated] = useState(0)
  const clamped = Math.max(0, Math.min(100, score))

  const level    = clamped >= 80 ? 'safe' : clamped >= 40 ? 'caution' : 'danger'
  const color    = { safe: 'var(--green)', caution: 'var(--amber)', danger: 'var(--red)' }[level]
  const label    = { safe: 'SAFE', caution: 'CAUTION', danger: 'HIGH RISK' }[level]
  const glowColor = {
    safe:    'rgba(0,232,150,0.25)',
    caution: 'rgba(255,184,48,0.25)',
    danger:  'rgba(255,68,85,0.25)',
  }[level]
  const bgColor = {
    safe:    'rgba(0,232,150,0.05)',
    caution: 'rgba(255,184,48,0.05)',
    danger:  'rgba(255,68,85,0.05)',
  }[level]
  const borderColor = {
    safe:    'rgba(0,232,150,0.2)',
    caution: 'rgba(255,184,48,0.2)',
    danger:  'rgba(255,68,85,0.2)',
  }[level]

  const w  = size === 'sm' ? 120 : 160
  const h  = size === 'sm' ? 70  : 92
  const r  = size === 'sm' ? 44  : 64
  const cx = size === 'sm' ? 60  : 80
  const cy = size === 'sm' ? 60  : 80
  const fs = size === 'sm' ? 24  : 34
  const sw = size === 'sm' ? 8   : 10

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(clamped), 100)
    return () => clearTimeout(timer)
  }, [clamped])

  const circumference = Math.PI * r
  const offset = circumference - (animated / 100) * circumference

  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: bgColor, border: `1px solid ${borderColor}`,
      borderRadius: 20, padding: size === 'sm' ? '20px 24px 14px' : '28px 32px 20px',
      boxShadow: `0 0 40px ${glowColor}`,
    }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} strokeLinecap="round" />
        <path
          d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        <text
          x={cx} y={cy - 8} textAnchor="middle"
          fontSize={fs} fontWeight="800" fill={color} fontFamily="Syne, sans-serif"
        >
          {clamped}
        </text>
      </svg>
      <span style={{
        marginTop: 4, fontSize: 11, fontWeight: 700, letterSpacing: 2, color,
        background: `${color}18`, border: `1px solid ${color}40`,
        borderRadius: 100, padding: '4px 14px', fontFamily: 'Syne, sans-serif',
      }}>
        {label}
      </span>
    </div>
  )
}