import { createClient } from '@/lib/supabase/client'

export async function uploadProofFiles(files: File[], userId: string): Promise<string[]> {
  const supabase = createClient()
  const urls: string[] = []

  for (const file of files) {
    // validate
    if (!file.type.startsWith('image/')) continue
    if (file.size > 5 * 1024 * 1024) continue // 5MB max

    const ext      = file.name.split('.').pop()
    const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('report-proof')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (!error) urls.push(filename)
  }

  return urls
}