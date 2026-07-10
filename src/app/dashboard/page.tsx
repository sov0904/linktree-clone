import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { ProfileForm } from '@/components/profile-form'

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
    .select('username, display_name, bio, avatar_url, bg_color, button_color')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-400">
              Tu página pública será <code>/{profile.username}</code>
            </p>
          </div>
          <form action={logout}>
            <button className="rounded-md border border-slate-700 px-3 py-1.5 text-sm">
              Cerrar sesión
            </button>
          </form>
        </div>

        <ProfileForm profile={profile} />

        <p className="text-sm text-slate-500">
          Próximamente (Fase 3): agregar, eliminar y reordenar links.
        </p>
      </div>
    </main>
  )
}
