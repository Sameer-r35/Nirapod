import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
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
    description: `Community trust score for ${decoded}. Check if this Facebook page or bKash number is safe before sending money.`,
  }
}

const REPORT_LABELS: Record<string, string> = {
  took_money_blocked: 'Took money and blocked',
  fake_product: 'Fake or damaged product',
  delayed_delivery: 'Delayed delivery',
  wrong_item: 'Wrong item sent',
  other: 'Other issue',
}

export default async function SearchResultPage({ params }: PageProps) {
  const { query } = await params
  const supabase = await createServerSupabaseClient()
  const decoded = decodeURIComponent(query)
  const isPhone = isBkashNumber(decoded)

  let entity: Entity | null = null
  let reports: IncidentReport[] = []
  let linkedEntities: Entity[] = []

  if (isPhone) {
    const { data } = await supabase
      .from('entities')
      .select('*')
      .contains('bkash_numbers', [decoded])

    linkedEntities = data ?? []

    const { data: phoneReports } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('bkash_number_used', decoded)
      .eq('status', 'verified')
      .order('created_at', { ascending: false })

    reports = phoneReports ?? []

  } else {
    const canonical = normalizeFacebookUrl(decoded)

    const { data: entityData } = await supabase
      .from('entities')
      .select('*')
      .eq('canonical_id', canonical)
      .single()

    entity = entityData

    if (entity) {
      const { data: reportData } = await supabase
        .from('incident_reports')
        .select('*')
        .eq('entity_id', entity.id)
        .eq('status', 'verified')
        .order('created_at', { ascending: false })

      reports = reportData ?? []
    }
  }

  const noResults = !isPhone && !entity

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">

      <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        ← Back to search
      </Link>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          {isPhone ? 'bKash / Nagad Number' : 'Facebook Page'}
        </p>
        <h1 className="mt-1 text-xl font-semibold break-all">{decoded}</h1>
      </div>

      {noResults && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
          <p className="font-semibold text-green-800">No reports found</p>
          <p className="mt-1 text-sm text-green-700">
            This page has no recorded scam reports in Nirapod. Always proceed with caution and keep proof of transactions.
          </p>
          <Link
            href="/report"
            className="mt-4 inline-block rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Report this page
          </Link>
        </div>
      )}

      {entity && !isPhone && (
        <div className="space-y-6">
          <TrustDial score={entity.trust_score} />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{entity.total_reports}</p>
              <p className="text-xs text-gray-500">Verified reports</p>
            </div>
            <div className="rounded-xl border bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{entity.bkash_numbers.length}</p>
              <p className="text-xs text-gray-500">Linked wallet numbers</p>
            </div>
          </div>

          <Link
            href="/report"
            className="block w-full rounded-full border border-red-300 py-3 text-center text-sm font-medium text-red-600 hover:bg-red-50"
          >
            + Report this page
          </Link>
        </div>
      )}

      {isPhone && (
        <div className="space-y-4">
          {linkedEntities.length === 0 && reports.length === 0 ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
              <p className="font-semibold text-green-800">Number not flagged</p>
              <p className="mt-1 text-sm text-green-700">
                This number has no scam reports in Nirapod.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-800">
                    This number is linked to {linkedEntities.length} flagged page(s)
                  </p>
                </div>
              </div>
              {linkedEntities.map((e) => (
                <Link
                  key={e.id}
                  href={`/search/${encodeURIComponent(e.fb_url ?? e.canonical_id)}`}
                  className="block rounded-xl border p-4 hover:bg-gray-50"
                >
                  <p className="text-sm font-medium">{e.fb_url ?? e.canonical_id}</p>
                  <p className="text-xs text-gray-500">Trust score: {e.trust_score}</p>
                </Link>
              ))}
            </>
          )}
        </div>
      )}

      {reports.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Verified Reports
          </h2>
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {REPORT_LABELS[r.report_type] ?? r.report_type}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{r.description}</p>
              {r.proof_urls.length > 0 && (
                <p className="mt-1 text-xs text-green-600">✓ Proof uploaded</p>
              )}
            </div>
          ))}
        </div>
      )}

    </main>
  )
}