import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <form action={logout}>
            <button className="rounded-md border border-slate-700 px-3 py-1.5 text-sm">
              Cerrar sesión
            </button>
          </form>
        </div>
        <p className="text-slate-300">
          Bienvenido, <strong>{profile?.display_name ?? profile?.username}</strong>.
          Tu página pública será <code>/{profile?.username}</code>.
        </p>
        <p className="text-sm text-slate-500">
          Próximamente (Fase 2): editar avatar, bio y colores.
        </p>
      </div>
    </main>
  )
}
