import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { ProfileForm } from '@/components/profile-form'
import { LinksManager } from '@/components/links-manager'

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

  const { data: links } = await supabase
    .from('links')
    .select('id, title, url, position')
    .eq('profile_id', user.id)
    .order('position', { ascending: true })

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

        <LinksManager links={links ?? []} buttonColor={profile.button_color} />
      </div>
    </main>
  )
}
