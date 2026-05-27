"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    setIsLoading(true);

    const response = await fetch("/api/Auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao solicitar recuperação de senha.");
      return;
    }

    setMessage(data.message);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Mail className="h-5 w-5" />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
              Esqueceu sua senha?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Informe seu e-mail e enviaremos instruções para redefinir sua
              senha.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  E-mail
                </label>

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="pedro@email.com"
                  type="email"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              {message && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Enviando..." : "Enviar instruções"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
