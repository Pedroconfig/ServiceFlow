"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const response = await fetch("/api/Auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao fazer login.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">
                SF
              </div>

              <div>
                <h1 className="text-lg font-bold">ServiceFlow</h1>
                <p className="text-sm text-slate-400">
                  Gestão de ordens de serviço
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
                Plataforma B2B
              </p>

              <h2 className="mt-6 text-5xl font-bold leading-tight tracking-tight">
                Organize clientes, serviços e ordens em um só lugar.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Crie ordens de serviço personalizadas, acompanhe status e gere
                PDFs profissionais com os dados da sua empresa.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-bold">PDF</p>
              <p className="mt-2 text-sm text-slate-400">
                Documentos prontos para enviar.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-bold">CRM</p>
              <p className="mt-2 text-sm text-slate-400">
                Clientes e serviços centralizados.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-bold">OS</p>
              <p className="mt-2 text-sm text-slate-400">
                Controle do fluxo operacional.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                SF
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-950">
                  ServiceFlow
                </h1>
                <p className="text-sm text-slate-500">Ordens de serviço</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <FileText className="h-5 w-5" />
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Entrar na conta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Acesse o painel para gerenciar clientes, serviços e ordens da
                sua empresa.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="pedro@email.com"
                      type="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Senha
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite sua senha"
                      type="password"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Ainda não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-slate-950 hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              ServiceFlow — sistema de gestão de ordens de serviço.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
