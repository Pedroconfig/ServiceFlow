"use client";

import Link from "next/link";
import { SubmitEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string;
};

type DraftItem = {
  serviceId: string;
  quantity: number;
};

type ServiceOrder = {
  id: string;
  code: string;
  description: string | null;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  total: string;
  createdAt: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: {
    id: string;
    serviceName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];
};

const statusLabels: Record<ServiceOrder["status"], string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
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

export default function ServiceOrderPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);

  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<DraftItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const serviceMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service]));
  }, [services]);

  const draftTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const service = serviceMap.get(item.serviceId);

      if (!service) {
        return total;
      }

      return total + Number(service.price) * item.quantity;
    }, 0);
  }, [items, serviceMap]);

  useEffect(() => {
    async function loadData() {
      const [clientsResponse, servicesResponse, ordersResponse] =
        await Promise.all([
          fetch("/api/clients"),
          fetch("/api/services"),
          fetch("/api/service-order"),
        ]);

      if (
        clientsResponse.status === 401 ||
        servicesResponse.status === 401 ||
        ordersResponse.status === 401
      ) {
        router.push("/login");
        return;
      }

      if (!clientsResponse.ok || !servicesResponse.ok || !ordersResponse.ok) {
        setError("Erro ao carregar dados da página.");
        setIsLoading(false);
        return;
      }

      const [clientsData, servicesData, ordersData] = await Promise.all([
        clientsResponse.json(),
        servicesResponse.json(),
        ordersResponse.json(),
      ]);

      setClients(clientsData);
      setServices(servicesData);
      setServiceOrders(ordersData);
      setIsLoading(false);
    }

    loadData();
  }, [router]);

  function handleAddItem() {
    setError("");

    if (!selectedServiceId) {
      setError("Selecione um serviço.");
      return;
    }

    if (quantity <= 0) {
      setError("A quantidade precisa ser maior que zero.");
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        serviceId: selectedServiceId,
        quantity,
      },
    ]);

    setSelectedServiceId("");
    setQuantity(1);
  }

  function handleRemoveItem(index: number) {
    setItems((currentItems) =>
      currentItems.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!clientId) {
      setError("Selecione um cliente.");
      return;
    }

    if (items.length === 0) {
      setError("Adicione pelo menos um item à ordem.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/service-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        description,
        items,
      }),
    });

    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Erro ao criar ordem de serviço.");
      return;
    }

    setServiceOrders((currentOrders) => [data, ...currentOrders]);

    setClientId("");
    setDescription("");
    setSelectedServiceId("");
    setQuantity(1);
    setItems([]);
  }

  async function handleStatusChange(
    orderId: string,
    status: ServiceOrder["status"]
  ) {
    setError("");

    const response = await fetch(`/api/service-order/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Erro ao atualizar status.");
      return;
    }

    setServiceOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: data.status,
            }
          : order
      )
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-600">Carregando ordens de serviço...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Ordens de Serviço
            </h1>
            <p className="text-sm text-zinc-500">
              Crie, acompanhe e exporte ordens em PDF.
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

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">
            Nova ordem de serviço
          </h2>

          <p className="mt-1 text-sm text-zinc-600">
            Selecione um cliente, adicione serviços e gere a OS.
          </p>

          {clients.length === 0 && (
            <div className="mt-4 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              Cadastre pelo menos um cliente antes de criar uma OS.
            </div>
          )}

          {services.length === 0 && (
            <div className="mt-4 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              Cadastre pelo menos um serviço antes de criar uma OS.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Cliente
              </label>

              <select
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                <option value="">Selecione um cliente</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Descrição
              </label>

              <textarea
                className="min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva a solicitação do cliente."
              />
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
              <h3 className="font-semibold text-zinc-900">Adicionar item</h3>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Serviço
                  </label>

                  <select
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                    value={selectedServiceId}
                    onChange={(event) =>
                      setSelectedServiceId(event.target.value)
                    }
                  >
                    <option value="">Selecione um serviço</option>

                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} — {formatCurrency(service.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">
                    Quantidade
                  </label>

                  <input
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    type="number"
                    min="1"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Adicionar item
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="rounded-xl border border-zinc-200 p-4">
                <h3 className="font-semibold text-zinc-900">
                  Itens adicionados
                </h3>

                <div className="mt-3 space-y-3">
                  {items.map((item, index) => {
                    const service = serviceMap.get(item.serviceId);
                    const subtotal = service
                      ? Number(service.price) * item.quantity
                      : 0;

                    return (
                      <div
                        key={`${item.serviceId}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-lg bg-zinc-50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {service?.name ?? "Serviço removido"}
                          </p>

                          <p className="mt-1 text-sm text-zinc-600">
                            {item.quantity} x{" "}
                            {formatCurrency(service?.price ?? 0)} ={" "}
                            <strong className="text-zinc-900">
                              {formatCurrency(subtotal)}
                            </strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border-t border-zinc-200 pt-4 text-right">
                  <p className="text-sm text-zinc-600">Total estimado</p>
                  <p className="text-xl font-bold text-zinc-900">
                    {formatCurrency(draftTotal)}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting || clients.length === 0 || services.length === 0
              }
              className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Criando OS..." : "Criar ordem de serviço"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Ordens cadastradas
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Total: {serviceOrders.length}
            </p>
          </div>

          {serviceOrders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
              <p className="text-sm text-zinc-600">
                Nenhuma ordem de serviço cadastrada ainda.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {serviceOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-zinc-900">
                          {order.code}
                        </h3>

                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        <p>Cliente: {order.client.name}</p>
                        <p>Data: {formatDate(order.createdAt)}</p>
                        <p>
                          Total:{" "}
                          <strong className="text-zinc-900">
                            {formatCurrency(order.total)}
                          </strong>
                        </p>
                      </div>

                      {order.items.length > 0 && (
                        <div className="mt-3 rounded-lg bg-zinc-50 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                            Itens
                          </p>

                          <div className="space-y-1 text-sm text-zinc-700">
                            {order.items.map((item) => (
                              <p key={item.id}>
                                {item.serviceName} — {item.quantity} x{" "}
                                {formatCurrency(item.unitPrice)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <select
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value as ServiceOrder["status"]
                          )
                        }
                      >
                        <option value="OPEN">Aberta</option>
                        <option value="IN_PROGRESS">Em andamento</option>
                        <option value="COMPLETED">Concluída</option>
                        <option value="CANCELED">Cancelada</option>
                      </select>

                      <a
                        href={`/api/service-order-pdf/${order.id}`}
                        target="_blank"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
                      >
                        Baixar PDF
                      </a>
                    </div>
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
