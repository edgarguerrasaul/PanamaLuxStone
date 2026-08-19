import { loginAdminAction } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <form action={loginAdminAction} className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-8">
        <h1 className="font-serif text-2xl font-semibold">Panel de administración</h1>
        <p className="text-sm text-neutral-500">Panamá LuxeStone</p>

        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Correo o contraseña incorrectos.
          </p>
        )}

        <input
          required
          type="email"
          name="email"
          placeholder="Correo"
          className="w-full rounded border border-neutral-300 px-3 py-2"
        />
        <input
          required
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full rounded border border-neutral-300 px-3 py-2"
        />
        <button type="submit" className="btn-primary w-full">
          Entrar
        </button>
      </form>
    </div>
  );
}
