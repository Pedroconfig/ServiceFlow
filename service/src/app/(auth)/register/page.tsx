"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  FileText,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const response = await fetch("/api/Auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        companyName,
      }),
    });

    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao criar conta.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_560px]">
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
                Comece agora
              </p>

              <h2 className="mt-6 text-5xl font-bold leading-tight tracking-tight">
                Crie sua conta e organize sua operação.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                Cadastre sua empresa, adicione clientes, serviços e gere ordens
                de serviço profissionais em poucos minutos.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white p-3 text-slate-950">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold">Agilidade e Organização</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Autenticação, empresa, clientes, serviços, ordens e PDF em um
                  fluxo completo de produto.
                </p>
              </div>
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
                <Building2 className="h-5 w-5" />
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Criar conta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Cadastre sua empresa e comece a gerar ordens de serviço
                personalizadas.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Seu nome
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Pedro Henrique"
                    />
                  </div>
                </div>

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
                      placeholder="Mínimo de 6 caracteres"
                      type="password"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nome da empresa
                  </label>

                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Oficina São Pedro"
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
                  {isLoading ? "Criando conta..." : "Criar conta"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-950 hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Ao criar uma conta, sua empresa será vinculada automaticamente ao
              seu usuário.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
