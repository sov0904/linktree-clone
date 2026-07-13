'use client'

import { useEffect } from 'react'

type ToastProps = {
  message: string
  variant: 'success' | 'error'
  onDismiss: () => void
  durationMs?: number
}

// Notificación flotante para el resultado GENERAL de una operación
// (éxito/error). Los errores de validación de un campo puntual van pegados
// a ese campo, no acá.
export function Toast({ message, variant, onDismiss, durationMs = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [onDismiss, durationMs])

  const isSuccess = variant === 'success'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 top-8 z-[100] mx-auto flex max-w-sm items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium shadow-2xl sm:inset-x-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 ${
        isSuccess
          ? 'border-emerald-400 bg-emerald-900 text-emerald-100 shadow-emerald-950/60'
          : 'border-red-400 bg-red-900 text-red-100 shadow-red-950/60'
      }`}
    >
      {isSuccess ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  )
}
