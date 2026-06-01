'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Shield, X } from 'lucide-react'
import { isBkashNumber } from '@/utils/normalize-url'

const STATS = [
  { num: '2.4K', label: 'Scams reported' },
  { num: '890',  label: 'Pages flagged' },
  { num: '৳48L', label: 'Losses prevented' },
]

const HOW_STEPS = [
  {
    num: '01',
    title: 'Search the page',
    desc: 'Paste the Facebook shop URL or their bKash/Nagad number before sending any advance payment.',
  },
  {
    num: '02',
    title: 'See the trust score',
    desc: 'Instantly see a community-verified score from 0–100 with a full breakdown of reported incidents and proof.',
  },
  {
    num: '03',
    title: 'Pay with confidence',
    desc: 'Green score? You\'re good. Red score? Walk away. Got scammed anyway? Report it and protect others.',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setError('Enter a Facebook page URL or bKash number')
      return
    }
    setError('')
    router.push(`/search/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="relative z-10">

      {/* ── NAV ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6,13,31,0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, var(--green), var(--green-dim))',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--green-glow-strong)',
              animation: 'glow-pulse 3s ease infinite',
            }}
          >
            <Shield size={18} color="#060d1f" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: '-0.5px',
              color: 'var(--text)',
            }}
          >
            নিরাপদ
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)', cursor: 'pointer' }}>
            How it works
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-dim)', cursor: 'pointer' }}>
            For businesses
          </span>
          <button
            onClick={() => router.push('/report')}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-green)',
              color: 'var(--green)',
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = 'var(--green-glow)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            Report a scam
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: 'calc(100vh - 73px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* radial glow */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 400,
            background:
              'radial-gradient(ellipse at center, rgba(0,232,150,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* live badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--border-green)',
            background: 'rgba(0,232,150,0.06)',
            borderRadius: 100,
            padding: '6px 14px',
            fontSize: 12,
            color: 'var(--green)',
            fontWeight: 500,
            marginBottom: 32,
            animation: 'fadeUp 0.6s ease both',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--green)',
              display: 'inline-block',
              animation: 'pulse-dot 2s infinite',
            }}
          />
          Live · Community-verified trust scores
        </div>

        {/* headline */}
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: 16,
            animation: 'fadeUp 0.6s 0.1s ease both',
            opacity: 0,
          }}
        >
          Check before you{' '}
          <span
            style={{
              color: 'var(--green)',
              textShadow: '0 0 40px var(--green-glow-strong)',
            }}
          >
            pay.
          </span>
        </h1>

        {/* subtitle */}
        <p
          style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'var(--text-dim)',
            fontWeight: 300,
            maxWidth: 480,
            lineHeight: 1.6,
            marginBottom: 48,
            animation: 'fadeUp 0.6s 0.2s ease both',
            opacity: 0,
          }}
        >
          Search any Facebook shop or bKash number before sending money.
          Community-verified trust scores protect you from f-commerce scams.
        </p>

        {/* search */}
        <form
          onSubmit={handleSearch}
          style={{
            width: '100%',
            maxWidth: 600,
            animation: 'fadeUp 0.6s 0.3s ease both',
            opacity: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--navy-2)',
              border: '1px solid var(--border-green)',
              borderRadius: 16,
              padding: '14px 16px 14px 20px',
              boxShadow: '0 0 40px rgba(0,232,150,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              marginBottom: 12,
              transition: 'all 0.3s',
            }}
          >
            <Search size={18} color="var(--green)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setError('') }}
              placeholder="Paste a Facebook URL or bKash/Nagad number..."
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 15,
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  padding: 4,
                }}
              >
                <X size={15} />
              </button>
            )}
            <button
              type="submit"
              style={{
                background: 'var(--green)',
                color: 'var(--navy)',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: '0.3px',
                transition: 'all 0.2s',
              }}
            >
              CHECK →
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center', marginBottom: 8 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['facebook.com/shopname', 'fb.com/shopname', '01712345678'].map(hint => (
              <span
                key={hint}
                style={{
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '4px 10px',
                }}
              >
                {hint}
              </span>
            ))}
          </div>
        </form>

        {/* stats */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            marginTop: 64,
            animation: 'fadeUp 0.6s 0.5s ease both',
            opacity: 0,
          }}
        >
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--green)',
                  display: 'block',
                }}
              >
                {s.num}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, display: 'block' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          padding: '80px 40px',
          borderTop: '1px solid var(--border)',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'var(--green)',
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          How Nirapod works
        </p>
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 32,
            letterSpacing: '-0.5px',
          }}
        >
          Three steps to stay safe
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {HOW_STEPS.map(step => (
            <div
              key={step.num}
              style={{
                background: 'var(--navy-2)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--green-glow)',
                  border: '1px solid var(--border-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--green)',
                  marginBottom: 16,
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {step.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}