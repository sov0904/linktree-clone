'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ALLOWED_AVATAR_TYPES, validateAvatarFile } from '@/lib/avatar'

export type ProfileFieldErrors = {
  display_name?: string
  bio?: string
  bg_color?: string
  button_color?: string
  avatar?: string
}

// `error` es el resultado general de la operación (se muestra en un toast).
// `fieldErrors` son errores de validación de un campo puntual (se muestran
// pegados a ese campo, nunca en el toast).
export type ProfileFormState =
  | { error?: string; success?: boolean; fieldErrors?: ProfileFieldErrors }
  | undefined

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

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

  const fieldErrors: ProfileFieldErrors = {}

  if (!displayName) {
    fieldErrors.display_name = 'El nombre no puede estar vacío.'
  }
  if (bio.length > 160) {
    fieldErrors.bio = 'La bio no puede superar 160 caracteres.'
  }
  if (!HEX_COLOR_RE.test(bgColor)) {
    fieldErrors.bg_color = 'Color hex inválido (#rrggbb).'
  }
  if (!HEX_COLOR_RE.test(buttonColor)) {
    fieldErrors.button_color = 'Color hex inválido (#rrggbb).'
  }

  const hasAvatarUpload = avatarFile instanceof File && avatarFile.size > 0
  if (hasAvatarUpload) {
    const avatarError = validateAvatarFile(avatarFile as File)
    if (avatarError) {
      fieldErrors.avatar = avatarError
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  let avatarUrl: string | undefined

  if (hasAvatarUpload) {
    const file = avatarFile as File
    const ext = ALLOWED_AVATAR_TYPES[file.type]
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      return { fieldErrors: { avatar: 'No se pudo subir la imagen.' } }
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
