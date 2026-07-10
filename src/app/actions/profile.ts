'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ProfileFormState = { error?: string; success?: boolean } | undefined

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const displayName = String(formData.get('display_name') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const bgColor = String(formData.get('bg_color') ?? '').trim()
  const buttonColor = String(formData.get('button_color') ?? '').trim()
  const avatarFile = formData.get('avatar')

  if (!displayName) {
    return { error: 'El nombre no puede estar vacío.' }
  }
  if (bio.length > 160) {
    return { error: 'La bio no puede superar 160 caracteres.' }
  }
  if (!HEX_COLOR_RE.test(bgColor) || !HEX_COLOR_RE.test(buttonColor)) {
    return { error: 'Los colores deben ser códigos hex válidos (#rrggbb).' }
  }

  let avatarUrl: string | undefined

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      return { error: 'La imagen no puede superar 2MB.' }
    }
    const ext = ALLOWED_AVATAR_TYPES[avatarFile.type]
    if (!ext) {
      return { error: 'Formato de imagen no soportado (usa PNG, JPG o WEBP).' }
    }

    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })

    if (uploadError) {
      return { error: 'No se pudo subir la imagen.' }
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
    // Cache-busting: el path es estable (upsert), así que sin esto el navegador
    // seguiría mostrando la imagen vieja tras reemplazarla.
    avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      bio: bio || null,
      bg_color: bgColor,
      button_color: buttonColor,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'No se pudo guardar el perfil.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
