'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Upload, X,
  CheckCircle, AlertTriangle, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useMobile } from '@/hooks/use-mobile'
import { createClient } from '@/lib/supabase/client'
import { uploadProofFiles } from '@/utils/upload-proof'
import { submitReport } from './actions'

const SCAM_TYPES = [
  { value: 'took_money_blocked', label: 'Took money & blocked',    desc: 'Paid in advance, then got blocked',       penalty: 40 },
  { value: 'fake_product',       label: 'Fake or damaged product', desc: 'Received counterfeit or broken item',     penalty: 15 },
  { value: 'wrong_item',         label: 'Wrong item sent',         desc: 'Received completely different product',   penalty: 10 },
  { value: 'delayed_delivery',   label: 'Delayed delivery',        desc: 'Order significantly delayed or ignored',  penalty: 5  },
  { value: 'other',              label: 'Other issue',             desc: 'Another type of problem',                 penalty: 5  },
]

const STEPS = ['Page details', 'What happened', 'Upload proof']

export default function ReportPage() {
  const router   = useRouter()
  const isMobile = useMobile()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [step, setStep]               = useState(0)
  const [fbUrl, setFbUrl]             = useState('')
  const [bkashNum, setBkashNum]       = useState('')
  const [reportType, setReportType]   = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles]             = useState<File[]>([])
  const [previews, setPreviews]       = useState<string[]>([])
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)

  // auth check
  const [authChecked, setAuthChecked] = useState(false)
  const [authed, setAuthed]           = useState(false)

  useState(() => {
    createClient().auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
      setAuthChecked(true)
    })
  })

  function validateStep(): boolean {
    setError('')
    if (step === 0 && !fbUrl.trim()) {
      setError('Please enter the Facebook page URL or username.')
      return false
    }
    if (step === 1 && !reportType) {
      setError('Please select the type of scam.')
      return false
    }
    if (step === 1 && description.trim().length < 20) {
      setError('Please describe what happened (at least 20 characters).')
      return false
    }
    if (step === 2 && files.length === 0) {
      setError('Please upload at least one proof screenshot.')
      return false
    }
    return true
  }

  function next() {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  function back() {
    setError('')
    setStep(s => s - 1)
  }

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const arr    = Array.from(selected).slice(0, 4)
    const valid  = arr.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    setFiles(prev => [...prev, ...valid].slice(0, 4))
    valid.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string].slice(0, 4))
      reader.readAsDataURL(f)
    })
  }

  function removeFile(i: number) {
    setFiles(prev  => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
  if (!validateStep()) return
  setLoading(true)
  setError('')

  try {
    const { data: { user }, error: authError } = await createClient().auth.getUser()
    console.log('Auth user:', user)
    console.log('Auth error:', authError)

    if (!user) { setError('You must be logged in.'); setLoading(false); return }

    console.log('Files to upload:', files.length, files.map(f => f.name))

    const proof_urls = await uploadProofFiles(files, user.id)
    console.log('Proof URLs after upload:', proof_urls)

    if (proof_urls.length === 0) {
      setError('Failed to upload proof images. Check console for details.')
      setLoading(false)
      return
    }

    const result = await submitReport({
      fb_url: fbUrl, bkash_number_used: bkashNum,
      report_type: reportType, description, proof_urls,
    })

    console.log('Submit result:', result)

    if (result.error) { setError(result.error); setLoading(false); return }
    setDone(true)
  } catch (err) {
    console.error('handleSubmit error:', err)
    setError('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

  // ── NOT AUTHED ──
  if (authChecked && !authed) {
    return (
      <AuthGate isMobile={isMobile} />
    )
  }

  // ── SUCCESS ──
  if (done) {
    return (
      <SuccessScreen isMobile={isMobile} fbUrl={fbUrl} router={router} />
    )
  }

  return (
    <div className="relative z-10" style={{ minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '16px 20px' : '20px 40px',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,13,31,0.85)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, var(--green), var(--green-dim))',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--green-glow-strong)',
          }}>
            <span style={{ fontSize: 15 }}>🛡</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
            নিরাপদ
          </span>
        </Link>
        <Link href="/" style={{
          fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <ArrowLeft size={14} /> Back
        </Link>
      </nav>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: isMobile ? '32px 20px 80px' : '48px 24px 80px' }}>

        {/* title */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>
            Report a scam
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 24 : 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Help protect others
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.6 }}>
            Your report will be reviewed before going public. Upload proof to verify your claim.
          </p>
        </div>

        {/* stepper */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, fontFamily: 'Syne, sans-serif',
                  background: i < step
                    ? 'var(--green)'
                    : i === step
                      ? 'var(--green-glow)'
                      : 'rgba(255,255,255,0.06)',
                  border: i <= step ? '1px solid var(--border-green)' : '1px solid var(--border)',
                  color: i < step ? 'var(--navy)' : i === step ? 'var(--green)' : 'var(--text-dim)',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: 12, fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {s}
                  </span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1,
                  background: i < step ? 'var(--green)' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* card */}
        <div style={{
          background: 'var(--navy-2)', border: '1px solid var(--border)',
          borderRadius: 20, padding: isMobile ? '24px 20px' : '32px 28px',
        }}>

          {/* ── STEP 0 — page details ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Facebook Page URL or Username *" hint="e.g. facebook.com/shopname or just 'shopname'">
                <input
                  value={fbUrl}
                  onChange={e => { setFbUrl(e.target.value); setError('') }}
                  placeholder="facebook.com/shopname"
                  style={inputStyle}
                  autoFocus
                />
              </Field>
              <Field label="Scammer's bKash / Nagad Number" hint="The number you sent money to (optional but strongly recommended)">
                <input
                  value={bkashNum}
                  onChange={e => setBkashNum(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  style={inputStyle}
                  type="tel"
                />
              </Field>
            </div>
          )}

          {/* ── STEP 1 — what happened ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Type of scam *" hint="Select the category that best describes what happened">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {SCAM_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setReportType(t.value); setError('') }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                        border: reportType === t.value
                          ? '1px solid var(--border-green)'
                          : '1px solid var(--border)',
                        background: reportType === t.value
                          ? 'var(--green-glow)'
                          : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s', textAlign: 'left', width: '100%',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: reportType === t.value ? 'var(--green)' : 'var(--text)', marginBottom: 2 }}>
                          {t.label}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{t.desc}</p>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 12,
                        color: 'var(--red)', background: 'rgba(255,68,85,0.1)',
                        padding: '3px 8px', borderRadius: 6,
                      }}>
                        −{t.penalty}pts
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Describe what happened *" hint="Be specific — include amounts, dates, and what the shop promised">
                <textarea
                  value={description}
                  onChange={e => { setDescription(e.target.value); setError('') }}
                  placeholder="e.g. I paid 1500 BDT via bKash on 1st June for a t-shirt. The page admin confirmed the order, then blocked me without delivering."
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.6 }}
                />
                <span style={{ fontSize: 11, color: description.length < 20 ? 'var(--red)' : 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                  {description.length} / 20 minimum characters
                </span>
              </Field>
            </div>
          )}

          {/* ── STEP 2 — upload proof ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>
                  Upload proof screenshots *
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.5 }}>
                  Upload your bKash payment receipt, chat screenshots, or photos of the wrong/fake product. Max 4 images, 5MB each.
                </p>

                {/* drop zone */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%', border: '2px dashed var(--border-green)',
                    borderRadius: 16, padding: '32px 20px',
                    background: 'rgba(0,232,150,0.03)',
                    cursor: 'pointer', display: 'flex',
                    flexDirection: 'column', alignItems: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,232,150,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,232,150,0.03)')}
                >
                  <Upload size={28} color="var(--green)" />
                  <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 600 }}>
                    {files.length > 0 ? 'Add more screenshots' : 'Tap to upload screenshots'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    JPG, PNG, WEBP — max 5MB each
                  </p>
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

              {/* previews */}
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={src} alt={`proof ${i + 1}`} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{
                          position: 'absolute', top: 6, right: 6,
                          background: 'rgba(0,0,0,0.7)', border: 'none',
                          borderRadius: '50%', width: 24, height: 24,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'white',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* legal disclaimer */}
              <div style={{
                background: 'rgba(255,184,48,0.06)', border: '1px solid rgba(255,184,48,0.2)',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <AlertTriangle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  By submitting, you confirm this report is truthful and based on your real experience.
                  False reports may result in account suspension. Your report will be reviewed before going public.
                </p>
              </div>
            </div>
          )}

          {/* error */}
          {error && (
            <div style={{
              marginTop: 16, padding: '12px 16px',
              background: 'rgba(255,68,85,0.08)', border: '1px solid rgba(255,68,85,0.25)',
              borderRadius: 10, fontSize: 13, color: 'var(--red)',
            }}>
              {error}
            </div>
          )}

          {/* nav buttons */}
          <div style={{
            display: 'flex', gap: 10, marginTop: 24,
            justifyContent: step === 0 ? 'flex-end' : 'space-between',
          }}>
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-dim)', padding: '12px 20px',
                  borderRadius: 10, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={next}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--green)', color: 'var(--navy)',
                  border: 'none', padding: '12px 24px',
                  borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                }}
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: loading ? 'rgba(0,232,150,0.4)' : 'var(--green)',
                  color: 'var(--navy)', border: 'none', padding: '12px 28px',
                  borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                {loading ? (
                  <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                ) : (
                  <>Submit Report</>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ── sub-components ──

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)', borderRadius: 10,
  padding: '12px 14px', fontSize: 14, color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', outline: 'none',
  transition: 'border-color 0.2s',
}

function AuthGate({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="relative z-10" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        maxWidth: 400, width: '100%', background: 'var(--navy-2)',
        border: '1px solid var(--border)', borderRadius: 20,
        padding: isMobile ? '32px 24px' : '40px 36px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--green-glow)', border: '1px solid var(--border-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 26,
        }}>🛡</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
          Sign in to report
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 28 }}>
          You need a verified account to submit a scam report. This prevents fake reports and protects legitimate businesses.
        </p>
        <Link href="/auth" style={{
          display: 'block', background: 'var(--green)', color: 'var(--navy)',
          padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          textDecoration: 'none', fontFamily: 'Syne, sans-serif',
        }}>
          Sign in with email
        </Link>
        <Link href="/" style={{ display: 'block', marginTop: 14, fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>
          ← Back to search
        </Link>
      </div>
    </div>
  )
}

function SuccessScreen({ isMobile, fbUrl, router }: { isMobile: boolean; fbUrl: string; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="relative z-10" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        maxWidth: 440, width: '100%', background: 'var(--navy-2)',
        border: '1px solid rgba(0,232,150,0.2)', borderRadius: 20,
        padding: isMobile ? '36px 24px' : '48px 40px', textAlign: 'center',
        boxShadow: '0 0 60px rgba(0,232,150,0.08)',
      }}>
        <CheckCircle size={52} color="var(--green)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 10, color: 'var(--green)' }}>
          Report submitted
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 28 }}>
          Your report for <strong style={{ color: 'var(--text)' }}>{fbUrl}</strong> is under review.
          It will go public once verified. Thank you for protecting the community.
        </p>
        <button
          onClick={() => router.push(`/search/${encodeURIComponent(fbUrl)}`)}
          style={{
            display: 'block', width: '100%',
            background: 'var(--green)', color: 'var(--navy)',
            border: 'none', padding: '13px', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', marginBottom: 10,
          }}
        >
          View trust score for this page
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'block', width: '100%',
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-dim)', padding: '13px', borderRadius: 10,
            fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Back to search
        </button>
      </div>
    </div>
  )
}