import { createClient } from '@/lib/supabase/client'

export async function uploadProofFiles(files: File[], userId: string): Promise<string[]> {
  const supabase = createClient()
  const urls: string[] = []

  for (const file of files) {
    console.log('Uploading file:', file.name, file.type, file.size)

    if (!file.type.startsWith('image/')) {
      console.log('Skipped — not an image:', file.type)
      continue
    }
    if (file.size > 5 * 1024 * 1024) {
      console.log('Skipped — too large:', file.size)
      continue
    }

    const ext      = file.name.split('.').pop()
    const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('report-proof')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    console.log('Upload data:', data)
    console.log('Upload error:', error)

    if (!error) urls.push(filename)
  }

  console.log('Final proof_urls:', urls)
  return urls
}