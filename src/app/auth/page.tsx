'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Phone, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useMobile } from '@/hooks/use-mobile'

export default function AuthPage() {
  const router   = useRouter()
  const isMobile = useMobile()
  const supabase = createClient()

  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [step, setStep]         = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return '+88' + digits
    if (digits.startsWith('88')) return '+' + digits
    return '+88' + digits
  }

  async function sendOtp() {
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 11) {
      setError('Enter a valid 11-digit Bangladeshi mobile number.')
      return
    }
    setLoading(true)
    const formatted = formatPhone(phone)
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatted })
    if (err) { setError(err.message); setLoading(false); return }
    setStep('otp')
    setLoading(false)
  }

  async function verifyOtp() {
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    const formatted = formatPhone(phone)
    const { error: err } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/report')
  }

  return (
    <div className="relative z-10" style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24,
    }}>

      <div style={{
        maxWidth: 400, width: '100%',
        background: 'var(--navy-2)', border: '1px solid var(--border)',
        borderRadius: 24, padding: isMobile ? '32px 24px' : '44px 40px',
      }}>

        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--green), var(--green-dim))',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--green-glow-strong)',
          }}>
            <Shield size={18} color="#060d1f" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
            নিরাপদ
          </span>
        </div>

        {step === 'phone' && (
          <>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Sign in
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 28, lineHeight: 1.6 }}>
              Enter your Bangladeshi mobile number. We'll send a one-time verification code.
            </p>

            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
              Mobile number
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 14px', marginBottom: 8,
            }}>
              <Phone size={16} color="var(--text-dim)" style={{ flexShrink: 0 }} />
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="01XXXXXXXXX"
                autoFocus
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', color: 'var(--text)', fontSize: 15,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>{error}</p>}

            <button
              onClick={sendOtp}
              disabled={loading}
              style={{
                width: '100%', background: loading ? 'rgba(0,232,150,0.4)' : 'var(--green)',
                color: 'var(--navy)', border: 'none', borderRadius: 12,
                padding: '13px', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4,
              }}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending code...</>
                : <>Send verification code <ArrowRight size={15} /></>
              }
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
              background: 'rgba(0,232,150,0.06)', border: '1px solid var(--border-green)',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <CheckCircle size={16} color="var(--green)" />
              <p style={{ fontSize: 13, color: 'var(--green)' }}>
                Code sent to {phone}
              </p>
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              Enter the code
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 28, lineHeight: 1.6 }}>
              Enter the 6-digit code sent to your phone.
            </p>

            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
              Verification code
            </label>
            <input
              type="text"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
              onKeyDown={e => e.key === 'Enter' && verifyOtp()}
              placeholder="000000"
              autoFocus
              maxLength={6}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px', fontSize: 24, fontWeight: 700,
                color: 'var(--text)', fontFamily: 'Syne, sans-serif',
                outline: 'none', letterSpacing: 8, textAlign: 'center',
                marginBottom: 8,
              }}
            />

            {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>{error}</p>}

            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              style={{
                width: '100%',
                background: loading || otp.length !== 6 ? 'rgba(0,232,150,0.4)' : 'var(--green)',
                color: 'var(--navy)', border: 'none', borderRadius: 12,
                padding: '13px', fontSize: 14, fontWeight: 700,
                cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                fontFamily: 'Syne, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4,
              }}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                : <>Verify & continue <ArrowRight size={15} /></>
              }
            </button>

            <button
              onClick={() => { setStep('phone'); setOtp(''); setError('') }}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer',
                marginTop: 14, fontFamily: 'DM Sans, sans-serif',
              }}
            >
              ← Use a different number
            </button>
          </>
        )}

        <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
          By signing in you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--green)', textDecoration: 'none' }}>Terms of Service</Link>
        </p>
      </div>

      <Link href="/" style={{ marginTop: 20, fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>
        ← Back to search
      </Link>
    </div>
  )
}