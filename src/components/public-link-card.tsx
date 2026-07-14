'use client'

import { useState } from 'react'

type PublicLinkCardProps = {
  url: string
}

export function PublicLinkCard({ url }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-700 bg-slate-800 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0 truncate text-sm text-slate-300">
        Tu página pública: <code className="text-slate-100">{url}</code>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium"
        >
          {copied ? '¡Copiado!' : 'Copiar link'}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium"
        >
          Ver mi página
        </a>
      </div>
    </div>
  )
}
