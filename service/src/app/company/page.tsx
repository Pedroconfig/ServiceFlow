"use client";
import Link from "next/link";
import { SubmitEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Company = {
  id: string;
  name: string;
  document: string;
  email: string | null;
  phone: string | null;
  logoUrl: string | null;
  address: string | null;
};

export default function CompanyPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadCompany() {
      const response = await fetch("/api/company/me");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError("Erro ao carregar dados da empresa.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      setCompany(data);
      setName(data.name ?? "");
      setDocument(data.document ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setLogoUrl(data.logoUrl ?? "");
      setAddress(data.address ?? "");

      setIsLoading(false);
    }

    loadCompany();
  }, [router]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/company/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        document,
        email,
        phone,
        logoUrl,
        address,
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao atualizar empresa.");
      return;
    }

    setCompany(data);
    setSuccessMessage("Dados da empresa atualizados com sucesso.");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-600">Carregando empresa...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Perfil da empresa
            </h1>
            <p className="text-sm text-zinc-500">
              Esses dados serão usados nas ordens de serviço.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Voltar
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">Dados comerciais</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Nome da empresa
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Oficina São Pedro"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Documento
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
                value={document}
                onChange={(event) => setDocument(event.target.value)}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                E-mail
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300   text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="contato@empresa.com"
                type="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Telefone
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="85999999999"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Logo URL
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Por enquanto use uma URL de imagem. Depois podemos trocar por
                upload.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Endereço
              </label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-zinc-300  text-zinc-900 placeholder:text-zinc-400 px-3 py-2 outline-none focus:border-zinc-900"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Rua Principal, 123"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>

        <aside className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">Prévia</h2>

          <div className="mt-6 rounded-xl border border-zinc-200 p-4">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo da empresa"
                className="mb-4 h-16 max-w-full object-contain"
              />
            ) : (
              <div className="mb-4 flex h-16 items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-500">
                Sem logo
              </div>
            )}

            <h3 className="font-bold text-zinc-900">{name || company?.name}</h3>

            <div className="mt-3 space-y-1 text-sm text-zinc-600">
              <p>Documento: {document || "-"}</p>
              <p>E-mail: {email || "-"}</p>
              <p>Telefone: {phone || "-"}</p>
              <p>Endereço: {address || "-"}</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
