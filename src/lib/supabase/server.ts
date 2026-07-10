import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server client para usar en Server Components, Server Actions y Route Handlers.
// Se crea una instancia nueva por request (no se debe reutilizar entre requests).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // set() puede fallar si se llama desde un Server Component (no desde
            // una Server Action o Route Handler). Es seguro ignorarlo porque el
            // proxy ya se encarga de refrescar la sesión en cada request.
          }
        },
      },
    }
  )
}
