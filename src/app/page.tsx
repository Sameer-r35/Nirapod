'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Shield } from 'lucide-react'
import { cn } from '@/utils/cn'
import { isBkashNumber } from '@/utils/normalize-url'

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      setError('Enter a Facebook page URL or bKash number')
      return
    }

    setError('')
    const encoded = encodeURIComponent(trimmed)
    router.push(`/search/${encoded}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-3xl font-bold tracking-tight">Nirapod</span>
          </div>
          <p className="text-sm text-gray-500">
            Check before you pay. Not after you cry.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex items-center rounded-full border border-gray-300 bg-white px-4 py-3 shadow-sm transition focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
            <Search className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setError('')
              }}
              placeholder="Paste a Facebook URL or bKash number"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {error && (
            <p className="mt-2 text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-green-600 py-3 text-sm font-medium text-white transition hover:bg-green-700 active:scale-95"
          >
            Check Trust Score
          </button>
        </form>

        {/* Helper text */}
        <div className="mt-6 flex flex-col items-center gap-1 text-xs text-gray-400">
          <p>Works with Facebook page URLs, usernames, and bKash/Nagad numbers</p>
          <p>e.g. facebook.com/someshop · fb.com/someshop · 01712345678</p>
        </div>

      </div>
    </main>
  )
}