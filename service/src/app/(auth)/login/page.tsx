"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Service Flow",
  description: "Sistema de ordem de serviço",
};

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
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Entrar</h1>

        <p className="mt-2 text-sm text-zinc-600">
          Acesse sua conta para gerenciar ordens de serviço.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              E-mail
            </label>
            <input
              className="w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="pedro@email.com"
              type="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Senha
            </label>
            <input
              className="w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="******"
              type="password"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900    placeholder:text-zinc-400 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Ainda não tem conta?{" "}
          <a href="/register" className="font-medium text-zinc-900 underline">
            Criar conta
          </a>
        </p>
      </div>
    </main>
  );
}
