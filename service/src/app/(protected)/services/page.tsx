"use client";

import { SubmitEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, FileText, Plus, Search, Trash2, Wrench } from "lucide-react";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export default function ServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return services;
    }

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.description?.toLowerCase().includes(normalizedSearch) ||
        service.price.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [services, search]);

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

    if (!name.trim()) {
      setError("Informe o nome do serviço.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Carregando serviços...
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
            Catálogo de serviços
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Serviços
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre serviços, valores e descrições para montar ordens de
            serviço rapidamente.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-950">{services.length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">Novo serviço</h2>
              <p className="text-sm text-slate-500">
                Adicione um serviço ao catálogo da empresa.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome do serviço
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Formatação de notebook"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Descrição
              </label>
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Instalação do sistema, drivers e programas básicos."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Preço
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  R$
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="150.00"
                  type="number"
                  step="0.01"
                  min="0"
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
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Cadastrar serviço"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Serviços cadastrados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Visualize e gerencie os serviços da empresa.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar serviço..."
              />
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <Wrench className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Nenhum serviço encontrado
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre um serviço ou ajuste sua busca.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Wrench className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          {service.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Criado em {formatDate(service.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(service.id)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      title="Deletar serviço"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Banknote className="h-4 w-4" />
                        <p className="text-xs font-medium uppercase tracking-wide">
                          Preço
                        </p>
                      </div>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                        {formatCurrency(service.price)}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="mt-0.5 text-slate-400">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Descrição
                        </p>

                        <p className="mt-0.5 leading-6 text-slate-700">
                          {service.description || "Sem descrição informada."}
                        </p>
                      </div>
                    </div>
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
