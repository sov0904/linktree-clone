import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AvatarFlip } from '@/components/avatar-flip'
import { LinkButton } from '@/components/link-button'
import { getContrastColor } from '@/lib/color'

type PageParams = { username: string }

// cache() evita repetir la misma query cuando generateMetadata y la página
// piden el perfil dentro del mismo request.
const getProfile = cache(async (username: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, bg_color, button_color')
    .eq('username', username)
    .single()

  return data
})

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    return { title: 'Perfil no encontrado' }
  }

  return {
    title: profile.display_name ?? profile.username,
    description: profile.bio ?? undefined,
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  const supabase = await createClient()
  const { data: links } = await supabase
    .from('links')
    .select('id, title, url')
    .eq('profile_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  const textColor = getContrastColor(profile.bg_color)

  return (
    <main
      className="flex min-h-screen justify-center px-4 pb-16 pt-16"
      style={{ backgroundColor: profile.bg_color }}
    >
      <div className="flex w-full max-w-md flex-col items-center">
        <AvatarFlip
          avatarUrl={profile.avatar_url}
          username={profile.username}
          buttonColor={profile.button_color}
          sizeClassName="h-24 w-24 md:h-32 md:w-32"
          textClassName="text-2xl md:text-3xl"
        />

        <h1 className="mt-4 text-xl font-bold md:text-2xl" style={{ color: textColor }}>
          {profile.display_name ?? profile.username}
        </h1>

        {profile.bio && (
          <p
            className="mt-2 text-center text-sm opacity-80 md:text-base"
            style={{ color: textColor }}
          >
            {profile.bio}
          </p>
        )}

        <div className="mt-8 flex w-full flex-col gap-3">
          {links && links.length > 0 ? (
            links.map((link) => (
              <LinkButton key={link.id} title={link.title} url={link.url} color={profile.button_color} />
            ))
          ) : (
            <p className="text-center text-sm opacity-70" style={{ color: textColor }}>
              Este perfil todavía no tiene links.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
