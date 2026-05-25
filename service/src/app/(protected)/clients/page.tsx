"use client";
import { SubmitEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      "tem certeza que deseja deletar este cliente ?"
    );
    if (!confirmDelete) {
      return;
    }
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "Erro ao deletar.");
      return;
    }
    setClients((currentClients) =>
      currentClients.filter((client) => client.id !== clientId)
    );
  }
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-600">Carregando clientes...</p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Clientes</h1>
            <p className="text-sm text-zinc-500">
              Gerencie os clientes da sua empresa.
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

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">Novo cliente</h2>

          <p className="mt-1 text-sm text-zinc-600">
            Cadastre um cliente para usar nas ordens de serviço.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Nome
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="João Silva"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Documento
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
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
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="cliente@email.com"
                type="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Telefone
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="85999999999"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Endereço
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Cadastrar cliente"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Clientes cadastrados
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Total: {clients.length}
              </p>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <p className="text-sm text-zinc-600">
                Nenhum cliente cadastrado ainda.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {client.name}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        <p>Documento: {client.document ?? "-"}</p>
                        <p>E-mail: {client.email ?? "-"}</p>
                        <p>Telefone: {client.phone ?? "-"}</p>
                        <p>Endereço: {client.address ?? "-"}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(client.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
