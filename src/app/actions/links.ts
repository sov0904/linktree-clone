'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { linkSchema, type LinkFieldErrors, type LinkFormValues } from '@/lib/schemas/link'

// Mismo criterio que profile.ts: `error` es el resultado general (toast),
// `fieldErrors` son errores de un campo puntual (se muestran pegados a ese
// campo, nunca en el toast).
export type LinkActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: LinkFieldErrors
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

function parseValues(values: LinkFormValues): LinkActionResult | { data: LinkFormValues } {
  const parsed = linkSchema.safeParse(values)
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors
    return { fieldErrors: { title: flat.title?.[0], url: flat.url?.[0] } }
  }
  return { data: parsed.data }
}

export async function addLink(values: LinkFormValues): Promise<LinkActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const parsed = parseValues(values)
  if (!('data' in parsed)) {
    return parsed
  }

  const { count } = await supabase
    .from('links')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  const { error } = await supabase.from('links').insert({
    profile_id: user.id,
    title: parsed.data.title,
    url: parsed.data.url,
    position: count ?? 0,
  })

  if (error) {
    return { error: 'No se pudo agregar el link.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateLink(id: string, values: LinkFormValues): Promise<LinkActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const parsed = parseValues(values)
  if (!('data' in parsed)) {
    return parsed
  }

  const { error } = await supabase
    .from('links')
    .update({ title: parsed.data.title, url: parsed.data.url })
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) {
    return { error: 'No se pudo guardar el link.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteLink(id: string): Promise<LinkActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const { error } = await supabase.from('links').delete().eq('id', id).eq('profile_id', user.id)

  if (error) {
    return { error: 'No se pudo eliminar el link.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function moveLink(id: string, direction: 'up' | 'down'): Promise<LinkActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) {
    return { error: 'Debes iniciar sesión.' }
  }

  const { data: links, error: fetchError } = await supabase
    .from('links')
    .select('id, position')
    .eq('profile_id', user.id)
    .order('position', { ascending: true })

  if (fetchError || !links) {
    return { error: 'No se pudo reordenar el link.' }
  }

  const index = links.findIndex((link) => link.id === id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (index === -1 || targetIndex < 0 || targetIndex >= links.length) {
    return { error: 'No se pudo reordenar el link.' }
  }

  const current = links[index]
  const target = links[targetIndex]

  const [{ error: errorA }, { error: errorB }] = await Promise.all([
    supabase.from('links').update({ position: target.position }).eq('id', current.id),
    supabase.from('links').update({ position: current.position }).eq('id', target.id),
  ])

  if (errorA || errorB) {
    return { error: 'No se pudo reordenar el link.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
