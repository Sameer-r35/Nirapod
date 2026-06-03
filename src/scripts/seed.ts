import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_ENTITIES = [
  {
    canonical_id:  'dhakafashionhouse',
    fb_url:        'facebook.com/dhakafashionhouse',
    bkash_numbers: ['01812345678'],
    trust_score:   18,
    total_reports: 3,
  },
  {
    canonical_id:  'gadgetbdofficial',
    fb_url:        'facebook.com/gadgetbdofficial',
    bkash_numbers: ['01987654321'],
    trust_score:   65,
    total_reports: 1,
  },
  {
    canonical_id:  'trustedshopdhaka',
    fb_url:        'facebook.com/trustedshopdhaka',
    bkash_numbers: [],
    trust_score:   95,
    total_reports: 0,
  },
]

const SEED_REPORTS = [
  {
    canonical_id:  'dhakafashionhouse',
    report_type:   'took_money_blocked',
    description:   'Sent 2200 BDT via bKash for a hoodie. Admin confirmed the order then blocked me immediately. Number 01812345678 is unreachable.',
    bkash_number:  '01812345678',
  },
  {
    canonical_id:  'dhakafashionhouse',
    report_type:   'fake_product',
    description:   'Ordered a branded t-shirt for 1500 BDT. Received a completely different low-quality item with no tags.',
    bkash_number:  '01812345678',
  },
  {
    canonical_id:  'dhakafashionhouse',
    report_type:   'took_money_blocked',
    description:   'Paid 3000 BDT advance for shoes. Page went silent after payment. Now the page has been renamed.',
    bkash_number:  '01812345678',
  },
  {
    canonical_id:  'gadgetbdofficial',
    report_type:   'delayed_delivery',
    description:   'Ordered a phone case 3 weeks ago. Still not delivered. Admin keeps saying it is coming soon.',
    bkash_number:  '01987654321',
  },
]

async function seed() {
  console.log('🌱 Seeding entities...')

  for (const entity of SEED_ENTITIES) {
    const { error } = await supabase
      .from('entities')
      .upsert(entity, { onConflict: 'canonical_id' })
    if (error) console.error('Entity error:', error.message)
    else console.log('✓', entity.canonical_id)
  }

  console.log('\n🌱 Seeding reports...')

  for (const report of SEED_REPORTS) {
    const { data: entity } = await supabase
      .from('entities')
      .select('id')
      .eq('canonical_id', report.canonical_id)
      .single()

    if (!entity) { console.error('Entity not found:', report.canonical_id); continue }

    const { error } = await supabase
      .from('incident_reports')
      .insert({
        entity_id:         entity.id,
        reporter_id:       '00000000-0000-0000-0000-000000000000',
        report_type:       report.report_type,
        description:       report.description,
        proof_urls:        ['seeded'],
        bkash_number_used: report.bkash_number,
        status:            'verified',
      })

    if (error) console.error('Report error:', error.message)
    else console.log('✓', report.report_type, 'for', report.canonical_id)
  }

  console.log('\n✅ Seed complete.')
}

seed()