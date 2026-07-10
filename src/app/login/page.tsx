'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { PasswordInput } from '@/components/password-input'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Inicia sesión</h1>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-slate-300">
              Contraseña
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-white py-2 font-medium text-slate-900 disabled:opacity-50"
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link href="/signup" className="text-white underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  )
}
