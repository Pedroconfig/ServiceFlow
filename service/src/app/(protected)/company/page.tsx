"use client";

import { SubmitEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  FileText,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  document: string | null;
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

    if (!name.trim()) {
      setError("Informe o nome da empresa.");
      return;
    }

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Carregando empresa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Configurações da empresa
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Empresa
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Atualize as informações comerciais usadas nas ordens de serviço e no
            PDF.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Empresa atual</p>
          <p className="max-w-52 truncate text-lg font-bold text-slate-950">
            {company?.name}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Dados comerciais
              </h2>
              <p className="text-sm text-slate-500">
                Essas informações aparecerão no documento da ordem.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome da empresa
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="NodeCore"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Documento
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  value={document}
                  onChange={(event) => setDocument(event.target.value)}
                  placeholder="CPF ou CNPJ"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="85999999999"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="contato@empresa.com"
                type="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Logo URL
              </label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                Use uma URL direta de imagem. Depois você pode evoluir para
                upload real.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Endereço
              </label>
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Rua Principal, 123"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Prévia da empresa
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Visualização dos dados que serão usados na OS.
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              {logoUrl ? (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <Image
                    src={logoUrl}
                    alt="Logo da empresa"
                    className="h-20 max-w-full object-contain"
                    width={196}
                    height={64}
                  />
                </div>
              ) : (
                <div className="mb-5 flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-6 w-6" />
                    <p className="mt-2 text-sm">Sem logo</p>
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-950">
                {name || "Nome da empresa"}
              </h3>

              <div className="mt-5 space-y-4">
                <PreviewRow
                  icon={<FileText className="h-4 w-4" />}
                  label="Documento"
                  value={document}
                />

                <PreviewRow
                  icon={<Mail className="h-4 w-4" />}
                  label="E-mail"
                  value={email}
                />

                <PreviewRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Telefone"
                  value={phone}
                />

                <PreviewRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Endereço"
                  value={address}
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-slate-700">{value || "-"}</p>
      </div>
    </div>
  );
}
