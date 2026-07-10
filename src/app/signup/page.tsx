'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import { PasswordInput } from '@/components/password-input'

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, undefined)

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="text-sm text-slate-400">
            Tu página pública estará en /tu-username
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-slate-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              placeholder="tu-username"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.message && (
            <p className="text-sm text-emerald-400">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-white py-2 font-medium text-slate-900 disabled:opacity-50"
          >
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-white underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
