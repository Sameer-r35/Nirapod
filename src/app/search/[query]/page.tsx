import { AlertTriangle, CheckCircle, Clock, ArrowLeft, Flag } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { normalizeFacebookUrl, isBkashNumber } from '@/utils/normalize-url'
import { TrustDial } from '@/components/trust-dial'
import type { Metadata } from 'next'
import type { Entity, IncidentReport } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ query: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { query } = await params
  const decoded = decodeURIComponent(query)
  return {
    title: `${decoded} — Nirapod Trust Check`,
    description: `Community trust score for ${decoded}. Check before you pay.`,
  }
}

const REPORT_LABELS: Record<string, string> = {
  took_money_blocked: 'Took money & blocked',
  fake_product:       'Fake or damaged product',
  delayed_delivery:   'Delayed delivery',
  wrong_item:         'Wrong item sent',
  other:              'Other issue',
}

const PENALTY: Record<string, number> = {
  took_money_blocked: 40,
  fake_product:       15,
  delayed_delivery:   5,
  wrong_item:         10,
  other:              5,
}

export default async function SearchResultPage({ params }: PageProps) {
  const { query } = await params
  const supabase   = await createServerSupabaseClient()
  const decoded    = decodeURIComponent(query)
  const isPhone    = isBkashNumber(decoded)

  let entity:        Entity | null  = null
  let reports:       IncidentReport[] = []
  let linkedEntities: Entity[]       = []

  if (isPhone) {
    const { data }       = await supabase.from('entities').select('*').contains('bkash_numbers', [decoded])
    linkedEntities       = data ?? []
    const { data: pr }   = await supabase.from('incident_reports').select('*')
      .eq('bkash_number_used', decoded).eq('status', 'verified').order('created_at', { ascending: false })
    reports = pr ?? []
  } else {
    const canonical      = normalizeFacebookUrl(decoded)
    const { data: ed }   = await supabase.from('entities').select('*').eq('canonical_id', canonical).single()
    entity               = ed
    if (entity) {
      const { data: rd } = await supabase.from('incident_reports').select('*')
        .eq('entity_id', entity.id).eq('status', 'verified').order('created_at', { ascending: false })
      reports = rd ?? []
    }
  }

  const noResults = !isPhone && !entity

  return (
    <div className="relative z-10" style={{ minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,13,31,0.85)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--green), var(--green-dim))',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--green-glow-strong)',
          }}>
            <span style={{ fontSize: 16 }}>🛡</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            নিরাপদ
          </span>
        </Link>
        <Link href="/report" style={{
          background: 'transparent', border: '1px solid rgba(255,68,85,0.3)',
          color: 'var(--red)', padding: '8px 18px', borderRadius: 8,
          fontSize: 13, fontWeight: 500, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Flag size={13} /> Report a scam
        </Link>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* back */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none', marginBottom: 32,
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={14} /> Back to search
        </Link>

        {/* query label */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
            {isPhone ? 'bKash / Nagad Number' : 'Facebook Page'}
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, wordBreak: 'break-all', color: 'var(--text)' }}>
            {decoded}
          </h1>
        </div>

        {/* ── NO RESULTS ── */}
        {noResults && (
          <div style={{
            background: 'rgba(0,232,150,0.05)', border: '1px solid rgba(0,232,150,0.2)',
            borderRadius: 20, padding: '40px 32px', textAlign: 'center',
          }}>
            <CheckCircle size={44} color="var(--green)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
              No reports found
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 24px' }}>
              This page has no recorded scam reports in Nirapod. Always keep proof of transactions before paying.
            </p>
            <Link href="/report" style={{
              display: 'inline-block',
              background: 'var(--green)', color: 'var(--navy)',
              padding: '10px 24px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
              fontFamily: 'Syne, sans-serif',
            }}>
              Report this page anyway
            </Link>
          </div>
        )}

        {/* ── ENTITY FOUND ── */}
        {entity && !isPhone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TrustDial score={entity.trust_score} />

            {/* stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { val: entity.total_reports,         label: 'Verified reports' },
                { val: entity.bkash_numbers.length,  label: 'Linked wallet numbers' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--navy-2)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: 20, textAlign: 'center',
                }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>
                    {s.val}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* penalty breakdown */}
            {reports.length > 0 && (
              <div style={{
                background: 'var(--navy-2)', border: '1px solid var(--border)',
                borderRadius: 14, padding: 20,
              }}>
                <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 14 }}>
                  Score breakdown
                </p>
                {Object.entries(PENALTY).map(([type, penalty]) => {
                  const count = reports.filter(r => r.report_type === type).length
                  if (!count) return null
                  return (
                    <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{REPORT_LABELS[type]}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{count}×</span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: 'var(--red)',
                          background: 'rgba(255,68,85,0.1)', padding: '2px 8px', borderRadius: 6,
                        }}>
                          −{penalty * count}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <Link href="/report" style={{
              display: 'block', textAlign: 'center',
              border: '1px solid rgba(255,68,85,0.3)', borderRadius: 12,
              padding: '14px', fontSize: 14, fontWeight: 600,
              color: 'var(--red)', textDecoration: 'none',
              background: 'rgba(255,68,85,0.05)',
            }}>
              + Report this page
            </Link>
          </div>
        )}

        {/* ── BKASH SEARCH ── */}
        {isPhone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {linkedEntities.length === 0 && reports.length === 0 ? (
              <div style={{
                background: 'rgba(0,232,150,0.05)', border: '1px solid rgba(0,232,150,0.2)',
                borderRadius: 20, padding: '40px 32px', textAlign: 'center',
              }}>
                <CheckCircle size={44} color="var(--green)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
                  Number not flagged
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 8 }}>
                  This number has no scam reports in Nirapod.
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  background: 'rgba(255,68,85,0.08)', border: '1px solid rgba(255,68,85,0.25)',
                  borderRadius: 14, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <AlertTriangle size={18} color="var(--red)" />
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>
                    This number is linked to {linkedEntities.length} flagged page(s)
                  </p>
                </div>
                {linkedEntities.map(e => (
                  <Link key={e.id} href={`/search/${encodeURIComponent(e.fb_url ?? e.canonical_id)}`}
                    style={{
                      display: 'block', background: 'var(--navy-2)',
                      border: '1px solid var(--border)', borderRadius: 14,
                      padding: '16px 20px', textDecoration: 'none',
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {e.fb_url ?? e.canonical_id}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                      Trust score: {e.trust_score}
                    </p>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── VERIFIED REPORTS ── */}
        {reports.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 16 }}>
              Verified Reports
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reports.map(r => (
                <div key={r.id} style={{
                  background: 'rgba(255,68,85,0.04)', border: '1px solid rgba(255,68,85,0.15)',
                  borderRadius: 14, padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--red)',
                      background: 'rgba(255,68,85,0.12)', padding: '3px 10px',
                      borderRadius: 6, border: '1px solid rgba(255,68,85,0.2)',
                    }}>
                      {REPORT_LABELS[r.report_type] ?? r.report_type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-dim)' }}>
                      <Clock size={11} />
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    {r.description}
                  </p>
                  {r.proof_urls.length > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✓ Proof uploaded
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}