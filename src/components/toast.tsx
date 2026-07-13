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
      className={`fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg sm:inset-x-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 ${
        isSuccess
          ? 'border-emerald-800 bg-emerald-950 text-emerald-300'
          : 'border-red-800 bg-red-950 text-red-300'
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
