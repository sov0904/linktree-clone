import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { ProfileForm } from '@/components/profile-form'
import { LinksManager } from '@/components/links-manager'
import { PublicLinkCard } from '@/components/public-link-card'

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

  // Mismo cálculo que en signup (ver actions/auth.ts): el origin real del
  // request, no una URL hardcodeada, para que funcione en local y en prod.
  const headersList = await headers()
  const origin =
    headersList.get('origin') ??
    `${headersList.get('x-forwarded-proto') ?? 'http'}://${headersList.get('host')}`
  const publicUrl = `${origin}/${profile.username}`

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <form action={logout}>
            <button className="rounded-md border border-slate-700 px-3 py-1.5 text-sm">
              Cerrar sesión
            </button>
          </form>
        </div>

        <PublicLinkCard url={publicUrl} />

        <ProfileForm profile={profile} />

        <LinksManager links={links ?? []} buttonColor={profile.button_color} />
      </div>
    </main>
  )
}
