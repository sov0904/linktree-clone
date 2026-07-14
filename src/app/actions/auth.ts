'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type AuthFormState = { error?: string; message?: string } | undefined

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const username = String(formData.get('username') ?? '')
    .trim()
    .toLowerCase()

  if (!email || !password || !username) {
    return { error: 'Completa todos los campos.' }
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      error:
        'El username debe tener 3-20 caracteres: minúsculas, números o "_".',
    }
  }

  const supabase = await createClient()

  // Chequeo temprano para dar feedback inmediato. La unicidad real la
  // garantiza el UNIQUE constraint + el trigger en la base de datos.
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existing) {
    return { error: 'Ese username ya está en uso.' }
  }

  // No dependemos de la Site URL configurada en el dashboard de Supabase
  // (solo soporta un valor "principal" y nos rompería el flujo en local vs.
  // producción). Calculamos el origin real del request y lo pasamos
  // explícito, así el link del correo siempre vuelve al mismo entorno
  // donde se hizo el signup. Requiere que ese origin esté en la lista de
  // "Redirect URLs" del dashboard (ver Authentication > URL Configuration).
  const headersList = await headers()
  const origin =
    headersList.get('origin') ??
    `${headersList.get('x-forwarded-proto') ?? 'http'}://${headersList.get('host')}`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: username },
      emailRedirectTo: `${origin}/login`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    redirect('/dashboard')
  }

  return {
    message:
      'Cuenta creada. Revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
  }
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Completa todos los campos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
