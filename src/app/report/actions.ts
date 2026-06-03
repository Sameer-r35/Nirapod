'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { normalizeFacebookUrl, isBkashNumber } from '@/utils/normalize-url'

export async function submitReport(formData: {
  fb_url: string
  bkash_number_used: string
  report_type: string
  description: string
  proof_urls: string[]
}) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to submit a report.' }

  const { fb_url, bkash_number_used, report_type, description, proof_urls } = formData

  if (!fb_url.trim())        return { error: 'Facebook page URL is required.' }
  if (!report_type)          return { error: 'Please select a scam type.' }
  if (!description.trim())   return { error: 'Please describe what happened.' }
  if (proof_urls.length === 0) return { error: 'Please upload at least one proof screenshot.' }

  // upsert entity
  const canonical = normalizeFacebookUrl(fb_url)
  let entityId: string

  const { data: existing } = await supabase
    .from('entities')
    .select('id, bkash_numbers')
    .eq('canonical_id', canonical)
    .single()

  if (existing) {
    entityId = existing.id
    // add bkash number to entity if new
    if (bkash_number_used && isBkashNumber(bkash_number_used)) {
      const merged = Array.from(new Set([...existing.bkash_numbers, bkash_number_used]))
      await supabase.from('entities').update({ bkash_numbers: merged }).eq('id', entityId)
    }
  } else {
    const bkash_numbers = bkash_number_used && isBkashNumber(bkash_number_used)
      ? [bkash_number_used]
      : []
    const { data: newEntity, error: entityError } = await supabase
      .from('entities')
      .insert({ canonical_id: canonical, fb_url: fb_url.trim(), bkash_numbers })
      .select('id')
      .single()
    if (entityError || !newEntity) return { error: 'Failed to create entity. Try again.' }
    entityId = newEntity.id
  }

  // ensure user profile exists
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.from('user_profiles').insert({
      id: user.id,
      phone: user.phone ?? '',
      karma_score: 100,
    })
  }

  // insert report
  const { error: reportError } = await supabase.from('incident_reports').insert({
    entity_id:         entityId,
    reporter_id:       user.id,
    report_type,
    description:       description.trim(),
    proof_urls,
    bkash_number_used: bkash_number_used || null,
    status:            'pending',
  })

  if (reportError) return { error: 'Failed to submit report. Try again.' }
  return { success: true }
}