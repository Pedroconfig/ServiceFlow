"use client";

import { SubmitEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  ListPlus,
  Plus,
  Search,
  Trash2,
  User,
  Wrench,
  XCircle,
} from "lucide-react";

type OrderStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

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
  status: OrderStatus;
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

const statusLabels: Record<OrderStatus, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

const statusStyles: Record<OrderStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-600/20",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELED: "bg-red-50 text-red-700 ring-red-600/20",
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  OPEN: <Clock3 className="h-4 w-4" />,
  IN_PROGRESS: <Clock3 className="h-4 w-4" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  CANCELED: <XCircle className="h-4 w-4" />,
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

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

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return serviceOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        order.code.toLowerCase().includes(normalizedSearch) ||
        order.client.name.toLowerCase().includes(normalizedSearch) ||
        order.description?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [serviceOrders, search, statusFilter]);

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

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.serviceId === selectedServiceId
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.serviceId === selectedServiceId
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          serviceId: selectedServiceId,
          quantity,
        },
      ];
    });

    setSelectedServiceId("");
    setQuantity(1);
  }

  function handleRemoveItem(serviceId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.serviceId !== serviceId)
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
      setError("Adicione pelo menos um serviço à ordem.");
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

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setError("");

    const response = await fetch(`/api/service-order-pdf/${orderId}`, {
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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Carregando ordens de serviço...
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
            Gestão operacional
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Ordens de serviço
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Crie, acompanhe, atualize status e exporte ordens de serviço em PDF.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total de ordens</p>
          <p className="text-2xl font-bold text-slate-950">
            {serviceOrders.length}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[430px_1fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <ListPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">Nova OS</h2>
              <p className="text-sm text-slate-500">
                Monte uma ordem com cliente, serviços e quantidades.
              </p>
            </div>
          </div>

          {clients.length === 0 && (
            <WarningBox message="Cadastre pelo menos um cliente antes de criar uma OS." />
          )}

          {services.length === 0 && (
            <WarningBox message="Cadastre pelo menos um serviço antes de criar uma OS." />
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Cliente
              </label>

              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Descrição
              </label>

              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descreva a solicitação do cliente."
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-500" />
                <h3 className="font-semibold text-slate-950">
                  Adicionar serviço
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Serviço
                  </label>

                  <select
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Quantidade
                  </label>

                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar à OS
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-950">
                  Serviços adicionados
                </h3>

                <div className="mt-4 space-y-3">
                  {items.map((item) => {
                    const service = serviceMap.get(item.serviceId);
                    const subtotal = service
                      ? Number(service.price) * item.quantity
                      : 0;

                    return (
                      <div
                        key={item.serviceId}
                        className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-950">
                            {service?.name ?? "Serviço removido"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.quantity} x{" "}
                            {formatCurrency(service?.price ?? 0)} ={" "}
                            <strong className="text-slate-950">
                              {formatCurrency(subtotal)}
                            </strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.serviceId)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                          title="Remover serviço"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-sm text-slate-300">Total estimado</p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(draftTotal)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    O total final será calculado novamente no backend.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting || clients.length === 0 || services.length === 0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {isSubmitting ? "Criando OS..." : "Criar ordem de serviço"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Ordens cadastradas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Acompanhe status, valores e documentos emitidos.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar OS ou cliente..."
                />
              </div>

              <select
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as OrderStatus | "ALL")
                }
              >
                <option value="ALL">Todos</option>
                <option value="OPEN">Abertas</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="COMPLETED">Concluídas</option>
                <option value="CANCELED">Canceladas</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                <FileText className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Nenhuma ordem encontrada
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Crie uma nova ordem ou ajuste os filtros.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {order.code}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Criada em {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            statusStyles[order.status]
                          }`}
                        >
                          {statusIcons[order.status]}
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <User className="h-4 w-4" />
                            <p className="text-xs font-medium uppercase tracking-wide">
                              Cliente
                            </p>
                          </div>

                          <p className="mt-2 font-semibold text-slate-950">
                            {order.client.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.client.phone ?? "Sem telefone"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-950 p-4 text-white">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Total
                          </p>

                          <p className="mt-2 text-2xl font-bold">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>

                      {order.description && (
                        <p className="mt-4 text-sm leading-6 text-slate-600">
                          {order.description}
                        </p>
                      )}

                      {order.items.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Serviços da OS
                          </p>

                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 text-sm"
                              >
                                <span className="text-slate-600">
                                  {item.serviceName}
                                </span>

                                <span className="font-medium text-slate-950">
                                  {item.quantity} x{" "}
                                  {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-52 flex-col gap-3">
                      <select
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value as OrderStatus
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
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4" />
                        Baixar PDF
                      </a>
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

function WarningBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
      {message}
    </div>
  );
}
