import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-4xl font-bold tracking-tight">LinkTree Clone</h1>
        <p className="text-slate-400 text-lg">Tu página de links personal, dinámica y configurable.</p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/signup" className="rounded-md bg-white px-4 py-2 font-medium text-slate-900">
            Crear cuenta
          </Link>
          <Link href="/login" className="rounded-md border border-slate-600 px-4 py-2 font-medium">
            Iniciar sesión
          </Link>
        </div>
        <p className="text-slate-500 text-sm mt-8">Próximamente: dashboard de perfil y links, páginas públicas.</p>
      </div>
    </main>
  );
}
