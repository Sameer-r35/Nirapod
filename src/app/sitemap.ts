import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient()

  const { data: entities } = await supabase
    .from('entities')
    .select('canonical_id, created_at')

  const entityUrls = (entities ?? []).map(e => ({
    url:          `https://nirapod.com/${e.canonical_id}`,
    lastModified: new Date(e.created_at),
    changeFrequency: 'weekly' as const,
    priority:     0.8,
  }))

  return [
    {
      url:          'https://nirapod.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority:     1,
    },
    {
      url:          'https://nirapod.com/report',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority:     0.5,
    },
    ...entityUrls,
  ]
}