"use client"

import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const URL_REGEX = /^https?:\/\//i

export function UrlInputForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [touched, setTouched] = useState(false)

  const trimmed = url.trim()
  const isValid = URL_REGEX.test(trimmed)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!isValid) return

    router.push(`/site/list/new?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10">
      <p className="text-xl font-semibold text-white mb-8" id="url-input-description">
        Drop your first link and watch the magic happen ✨
      </p>
      <div className="bg-white rounded-2xl p-2">
        <input
          type="url"
          placeholder="https://your-awesome-link.com"
          aria-label="Enter your URL to create a list"
          aria-describedby="url-input-description"
          className="w-full px-8 py-7 text-2xl rounded-xl outline-none border-2 border-transparent focus:border-blue-300 transition-colors"
          value={url}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value)}
          onBlur={() => setTouched(true)}
        />
      </div>
      {touched && !isValid ? (
        <p className="mt-3 text-base text-red-200">Please enter a valid URL that starts with http:// or https://</p>
      ) : null}
      <button
        type="submit"
        className="w-full mt-6 px-8 py-7 text-2xl font-bold text-gray-900 bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
        disabled={!isValid}
      >
        Create My List 🚀
      </button>

      <div className="mt-10 grid grid-cols-3 gap-6 text-white">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="text-2xl font-bold mb-1">Free</div>
          <div className="text-sm text-white/80">No limits</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="text-2xl font-bold mb-1">Fast</div>
          <div className="text-sm text-white/80">Instant setup</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
          <div className="text-2xl font-bold mb-1">Fun</div>
          <div className="text-sm text-white/80">Easy to use</div>
        </div>
      </div>
    </form>
  )
}
