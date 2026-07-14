import Link from 'next/link'

export default function ProfileNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 text-center text-white">
      <h1 className="text-2xl font-bold">Este perfil no existe</h1>
      <p className="text-sm text-slate-400">
        El usuario que buscás no está disponible o cambió de nombre.
      </p>
      <Link
        href="/"
        className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-800"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
