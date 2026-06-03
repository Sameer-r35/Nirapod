'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { useMobile } from '@/hooks/use-mobile'

const REPORT_LABELS: Record<string, string> = {
  took_money_blocked: 'Took money & blocked',
  fake_product:       'Fake or damaged product',
  delayed_delivery:   'Delayed delivery',
  wrong_item:         'Wrong item sent',
  other:              'Other issue',
}

export function AdminClient({ reports: initial }: { reports: any[] }) {
  const isMobile             = useMobile()
  const supabase             = createClient()
  const [reports, setReports] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(id: string, status: 'verified' | 'rejected') {
    setLoading(id)
    await supabase
      .from('incident_reports')
      .update({ status })
      .eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
    setLoading(null)
  }

  async function getProofUrl(path: string) {
    const { data } = await supabase.storage
      .from('report-proof')
      .createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="relative z-10" style={{ minHeight: '100vh' }}>

      {/* header */}
      <div style={{
        padding: isMobile ? '24px 20px' : '32px 40px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>
              Admin Panel
            </p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? 20 : 24, fontWeight: 800 }}>
              Pending Reviews
            </h1>
          </div>
          <div style={{
            background: 'rgba(255,68,85,0.1)', border: '1px solid rgba(255,68,85,0.25)',
            borderRadius: 10, padding: '8px 16px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>
              {reports.length}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>pending</p>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 20px' : '40px 40px' }}>

        {reports.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'var(--navy-2)', border: '1px solid var(--border)',
            borderRadius: 20,
          }}>
            <CheckCircle size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
              All clear
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 8 }}>
              No pending reports to review.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reports.map(r => (
            <div key={r.id} style={{
              background: 'var(--navy-2)', border: '1px solid var(--border)',
              borderRadius: 18, padding: isMobile ? '20px' : '24px 28px',
            }}>

              {/* top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
                    {r.entities?.fb_url ?? r.entities?.canonical_id ?? 'Unknown page'}
                  </p>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--red)',
                    background: 'rgba(255,68,85,0.12)', padding: '3px 10px',
                    borderRadius: 6, border: '1px solid rgba(255,68,85,0.2)',
                  }}>
                    {REPORT_LABELS[r.report_type] ?? r.report_type}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </div>
              </div>

              {/* description */}
              <p style={{
                fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6,
                marginBottom: 16, background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, padding: '12px 14px',
                borderLeft: '3px solid var(--border)',
              }}>
                {r.description}
              </p>

              {/* bkash number */}
              {r.bkash_number_used && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, color: 'var(--amber)',
                  background: 'rgba(255,184,48,0.08)', border: '1px solid rgba(255,184,48,0.2)',
                  borderRadius: 8, padding: '6px 12px', marginBottom: 16,
                }}>
                  📱 bKash: <strong>{r.bkash_number_used}</strong>
                </div>
              )}

              {/* proof images */}
              {r.proof_urls?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
                    Proof ({r.proof_urls.length} file{r.proof_urls.length > 1 ? 's' : ''})
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.proof_urls.map((path: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => getProofUrl(path)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'rgba(0,232,150,0.06)', border: '1px solid var(--border-green)',
                          color: 'var(--green)', borderRadius: 8, padding: '7px 12px',
                          fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        <ExternalLink size={12} /> View proof {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => updateStatus(r.id, 'verified')}
                  disabled={loading === r.id}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'rgba(0,232,150,0.1)', border: '1px solid rgba(0,232,150,0.3)',
                    color: 'var(--green)', borderRadius: 10, padding: '11px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {loading === r.id
                    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    : <><CheckCircle size={14} /> Verify & publish</>
                  }
                </button>
                <button
                  onClick={() => updateStatus(r.id, 'rejected')}
                  disabled={loading === r.id}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'rgba(255,68,85,0.08)', border: '1px solid rgba(255,68,85,0.25)',
                    color: 'var(--red)', borderRadius: 10, padding: '11px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}