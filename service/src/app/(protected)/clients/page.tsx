"use client";

import { SubmitEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  UserPlus,
  Users,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.email?.toLowerCase().includes(normalizedSearch) ||
        client.phone?.toLowerCase().includes(normalizedSearch) ||
        client.document?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [clients, search]);

  useEffect(() => {
    async function loadClients() {
      const response = await fetch("/api/clients");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError("Erro ao carregar clientes.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      setClients(data);
      setIsLoading(false);
    }

    loadClients();
  }, [router]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        document,
        email,
        phone,
        address,
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao cadastrar cliente.");
      return;
    }

    setClients((currentClients) => [data, ...currentClients]);

    setName("");
    setDocument("");
    setEmail("");
    setPhone("");
    setAddress("");
  }

  async function handleDelete(clientId: string) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este cliente?"
    );

    if (!confirmDelete) {
      return;
    }

    const response = await fetch(`/api/clients/${clientId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Erro ao deletar cliente.");
      return;
    }

    setClients((currentClients) =>
      currentClients.filter((client) => client.id !== clientId)
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Carregando clientes...
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
            Gestão de clientes
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Clientes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre e organize os clientes usados nas ordens de serviço.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-950">{clients.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Novo cliente
              </h2>
              <p className="text-sm text-slate-500">
                Adicione um cliente à sua empresa.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="João Silva"
              />
            </div>

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
                E-mail
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cliente@email.com"
                type="email"
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Endereço
              </label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Cadastrar cliente"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Clientes cadastrados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Visualize e gerencie os clientes da empresa.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cliente..."
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Nenhum cliente encontrado
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre um cliente ou ajuste sua busca.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {filteredClients.map((client) => (
                <article
                  key={client.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Users className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          {client.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Cliente cadastrado
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(client.id)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      title="Deletar cliente"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <InfoRow
                      icon={<FileText className="h-4 w-4" />}
                      label="Documento"
                      value={client.document}
                    />

                    <InfoRow
                      icon={<Mail className="h-4 w-4" />}
                      label="E-mail"
                      value={client.email}
                    />

                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Telefone"
                      value={client.phone}
                    />

                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Endereço"
                      value={client.address}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-3 text-slate-600">
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