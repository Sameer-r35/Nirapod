'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Shield, X, Menu } from 'lucide-react'
import { isBkashNumber } from '@/utils/normalize-url'
import { useMobile } from '@/hooks/use-mobile'

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
    desc: "Green score? You're good. Red score? Walk away. Got scammed anyway? Report it and protect others.",
  },
]

export default function HomePage() {
  const router   = useRouter()
  const isMobile = useMobile()
  const [query, setQuery]       = useState('')
  const [error, setError]       = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '16px 20px' : '20px 40px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,13,31,0.85)',
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--green), var(--green-dim))',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--green-glow-strong)',
            animation: 'glow-pulse 3s ease infinite', flexShrink: 0,
          }}>
            <Shield size={18} color="#060d1f" strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: isMobile ? 18 : 20, letterSpacing: '-0.5px', color: 'var(--text)',
          }}>
            নিরাপদ
          </span>
        </div>

        {/* desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)', cursor: 'pointer' }}>How it works</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)', cursor: 'pointer' }}>For businesses</span>
            <button
              onClick={() => router.push('/report')}
              style={{
                background: 'transparent', border: '1px solid var(--border-green)',
                color: 'var(--green)', padding: '8px 18px', borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Report a scam
            </button>
          </div>
        )}

        {/* mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4 }}
          >
            <Menu size={22} />
          </button>
        )}
      </nav>

      {/* mobile menu dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 65, left: 0, right: 0, zIndex: 99,
          background: 'var(--navy-2)', borderBottom: '1px solid var(--border)',
          padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <span style={{ fontSize: 14, color: 'var(--text-dim)', padding: '8px 0', cursor: 'pointer' }}>How it works</span>
          <span style={{ fontSize: 14, color: 'var(--text-dim)', padding: '8px 0', cursor: 'pointer' }}>For businesses</span>
          <button
            onClick={() => { router.push('/report'); setMenuOpen(false) }}
            style={{
              background: 'var(--green-glow)', border: '1px solid var(--border-green)',
              color: 'var(--green)', padding: '12px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              marginTop: 4,
            }}
          >
            Report a scam
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        minHeight: 'calc(100vh - 73px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '48px 20px 60px' : '60px 24px',
        textAlign: 'center', position: 'relative',
      }}>
        {/* radial glow */}
        <div style={{
          position: 'absolute',
          width: isMobile ? 300 : 600, height: isMobile ? 200 : 400,
          background: 'radial-gradient(ellipse at center, rgba(0,232,150,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: '1px solid var(--border-green)', background: 'rgba(0,232,150,0.06)',
          borderRadius: 100, padding: '6px 14px', fontSize: 12,
          color: 'var(--green)', fontWeight: 500, marginBottom: 28,
          animation: 'fadeUp 0.6s ease both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
            display: 'inline-block', animation: 'pulse-dot 2s infinite',
          }} />
          Live · Community-verified trust scores
        </div>

        {/* headline */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: isMobile ? 40 : 'clamp(40px, 6vw, 72px)',
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: isMobile ? '-1px' : '-2px',
          marginBottom: 16,
          animation: 'fadeUp 0.6s 0.1s ease both', opacity: 0,
        }}>
          Check before you{' '}
          <span style={{ color: 'var(--green)', textShadow: '0 0 40px var(--green-glow-strong)' }}>
            pay.
          </span>
        </h1>

        {/* subtitle */}
        <p style={{
          fontSize: isMobile ? 15 : 'clamp(14px, 2vw, 18px)',
          color: 'var(--text-dim)', fontWeight: 300,
          maxWidth: 480, lineHeight: 1.7,
          marginBottom: 40,
          animation: 'fadeUp 0.6s 0.2s ease both', opacity: 0,
          padding: isMobile ? '0 8px' : 0,
        }}>
          Search any Facebook shop or bKash number before sending money.
          Community-verified trust scores protect you from f-commerce scams.
        </p>

        {/* search form */}
        <form
          onSubmit={handleSearch}
          style={{
            width: '100%', maxWidth: 600,
            animation: 'fadeUp 0.6s 0.3s ease both', opacity: 0,
            padding: isMobile ? '0 4px' : 0,
          }}
        >
          {/* search box */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12,
            background: 'var(--navy-2)', border: '1px solid var(--border-green)',
            borderRadius: 16, padding: isMobile ? '12px 14px' : '14px 16px 14px 20px',
            boxShadow: '0 0 40px rgba(0,232,150,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            marginBottom: 12,
          }}>
            <Search size={16} color="var(--green)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setError('') }}
              placeholder={isMobile ? 'Facebook URL or bKash number...' : 'Paste a Facebook URL or bKash/Nagad number...'}
              autoFocus={!isMobile}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text)', fontSize: isMobile ? 14 : 15,
                fontFamily: 'DM Sans, sans-serif', minWidth: 0,
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2, flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              style={{
                background: 'var(--green)', color: 'var(--navy)',
                border: 'none', borderRadius: 10,
                padding: isMobile ? '9px 14px' : '10px 20px',
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700, fontFamily: 'Syne, sans-serif',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                letterSpacing: '0.3px',
              }}
            >
              {isMobile ? 'CHECK' : 'CHECK →'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center', marginBottom: 8 }}>
              {error}
            </p>
          )}

          {/* hints — hidden on very small screens */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['facebook.com/shopname', 'fb.com/shopname', '01712345678'].map(hint => (
                <span key={hint} style={{
                  fontSize: 11, color: 'var(--text-dim)',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '4px 10px',
                }}>
                  {hint}
                </span>
              ))}
            </div>
          )}

          {/* mobile hints — just one line */}
          {isMobile && (
            <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
              Works with Facebook URLs and bKash/Nagad numbers
            </p>
          )}
        </form>

        {/* stats */}
        <div style={{
          display: 'flex',
          gap: isMobile ? 24 : 48,
          marginTop: isMobile ? 48 : 64,
          animation: 'fadeUp 0.6s 0.5s ease both', opacity: 0,
        }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <span style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: isMobile ? 22 : 28,
                fontWeight: 800, color: 'var(--green)', display: 'block',
              }}>
                {s.num}
              </span>
              <span style={{
                fontSize: isMobile ? 10 : 12,
                color: 'var(--text-dim)', marginTop: 2, display: 'block',
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        borderTop: '1px solid var(--border)',
        maxWidth: 900, margin: '0 auto',
      }}>
        <p style={{
          fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--green)', fontWeight: 600, marginBottom: 12,
        }}>
          How Nirapod works
        </p>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: isMobile ? 22 : 28,
          fontWeight: 700, marginBottom: 28, letterSpacing: '-0.5px',
        }}>
          Three steps to stay safe
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {HOW_STEPS.map(step => (
            <div key={step.num} style={{
              background: 'var(--navy-2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: isMobile ? '20px' : '24px',
              display: isMobile ? 'flex' : 'block', gap: isMobile ? 16 : 0,
              alignItems: isMobile ? 'flex-start' : 'initial',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'var(--green-glow)', border: '1px solid var(--border-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800,
                color: 'var(--green)',
                marginBottom: isMobile ? 0 : 16,
              }}>
                {step.num}
              </div>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700,
                  marginBottom: 6, color: 'var(--text)',
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}