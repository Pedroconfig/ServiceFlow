"use client";
import Link from "next/link";
import { SubmitEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  createdAt: string;
};

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export default function ServicePage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      const response = await fetch("/api/services");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError("Erro ao carregar serviços.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      setServices(data);
      setIsLoading(false);
    }

    loadServices();
  }, [router]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        price: Number(price),
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao cadastrar serviço.");
      return;
    }

    setServices((currentServices) => [data, ...currentServices]);

    setName("");
    setDescription("");
    setPrice("");
  }

  async function handleDelete(serviceId: string) {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este serviço?"
    );

    if (!confirmDelete) {
      return;
    }

    const response = await fetch(`/api/services/${serviceId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Erro ao deletar serviço.");
      return;
    }

    setServices((currentServices) =>
      currentServices.filter((service) => service.id !== serviceId)
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-600">Carregando serviços...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Serviços</h1>
            <p className="text-sm text-zinc-500">
              Gerencie os serviços oferecidos pela sua empresa.
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
          <h2 className="text-lg font-bold text-zinc-900">Novo serviço</h2>

          <p className="mt-1 text-sm text-zinc-600">
            Cadastre serviços para usar nas ordens de serviço.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Nome do serviço
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Formatação de notebook"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Descrição
              </label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Instalação do sistema, drivers e programas básicos."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Preço
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="150.00"
                type="number"
                step="0.01"
                min="0"
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
              {isSubmitting ? "Salvando..." : "Cadastrar serviço"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Serviços cadastrados
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Total: {services.length}
            </p>
          </div>

          {services.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <p className="text-sm text-zinc-600">
                Nenhum serviço cadastrado ainda.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {service.name}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        <p>
                          Descrição:{" "}
                          {service.description ? service.description : "-"}
                        </p>
                        <p>
                          Preço:{" "}
                          <strong className="text-zinc-900">
                            {formatCurrency(service.price)}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(service.id)}
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
