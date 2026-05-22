"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type CurrentUser = {
  id: string;
  name: string;
  email: string;
  company: {
    id: string;
    name: string;
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, seTiSloading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const response = await fetch("/api/Auth/me");
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setUser(data.user);
      seTiSloading(false);
    }

    loadCurrentUser();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/Auth/logout", {
      method: "POST",
    });
    router.push("/login");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-600">Carregando...</p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">ServiceFlow</h1>
            <p className="text-sm text-zinc-500">Gestão de ordens de serviço</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900">
            Bem-vindo, {user?.name}
          </h2>

          <p className="mt-2 text-zinc-600">
            Empresa atual:{" "}
            <strong className="text-zinc-900">
              {user?.company?.name ?? "Empresa não encontrada"}
            </strong>
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <a
            href="/clients"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-zinc-900">Clientes</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Cadastre e gerencie clientes da empresa.
            </p>
          </a>

          <a
            href="/services"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-zinc-900">Serviços</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Cadastre serviços e valores para usar nas ordens.
            </p>
          </a>

          <a
            href="/service-order"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-zinc-900">Ordens de serviço</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Crie, acompanhe e gere PDFs das ordens.
            </p>
          </a>

          <a
            href="/company"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-bold text-zinc-900">Empresa</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Atualize dados comerciais usados nas ordens de serviço.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}
