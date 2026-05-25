import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Users,
  Wallet,
  Wrench,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "@/src/app/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

const statusLabels = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

const statusStyles = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-600/20",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELED: "bg-red-50 text-red-700 ring-red-600/20",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.company) {
    redirect("/login");
  }

  const companyId = user.company.id;

  const [
    clientsCount,
    servicesCount,
    serviceOrdersCount,
    openOrdersCount,
    inProgressOrdersCount,
    completedOrdersCount,
    canceledOrdersCount,
    totalAmount,
    recentOrders,
  ] = await Promise.all([
    prisma.client.count({
      where: {
        companyId,
      },
    }),

    prisma.service.count({
      where: {
        companyId,
      },
    }),

    prisma.serviceOrder.count({
      where: {
        companyId,
      },
    }),

    prisma.serviceOrder.count({
      where: {
        companyId,
        status: "OPEN",
      },
    }),

    prisma.serviceOrder.count({
      where: {
        companyId,
        status: "IN_PROGRESS",
      },
    }),

    prisma.serviceOrder.count({
      where: {
        companyId,
        status: "COMPLETED",
      },
    }),

    prisma.serviceOrder.count({
      where: {
        companyId,
        status: "CANCELED",
      },
    }),

    prisma.serviceOrder.aggregate({
      where: {
        companyId,
      },
      _sum: {
        total: true,
      },
    }),

    prisma.serviceOrder.findMany({
      where: {
        companyId,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(totalAmount._sum.total ?? 0);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Olá, {user.name}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe clientes, serviços e ordens da empresa{" "}
            <strong className="text-slate-700">{user.company.name}</strong>.
          </p>
        </div>

        <Link
          href="/service-order"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Nova ordem
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Clientes"
          value={clientsCount}
          description="Clientes cadastrados"
          icon={<Users className="h-5 w-5" />}
        />

        <MetricCard
          title="Serviços"
          value={servicesCount}
          description="Serviços disponíveis"
          icon={<Wrench className="h-5 w-5" />}
        />

        <MetricCard
          title="Ordens"
          value={serviceOrdersCount}
          description="Ordens registradas"
          icon={<FileText className="h-5 w-5" />}
        />

        <MetricCard
          title="Valor total"
          value={formatCurrency(totalRevenue)}
          description="Total em ordens"
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          title="Abertas"
          value={openOrdersCount}
          icon={<Clock3 className="h-5 w-5" />}
          className="bg-blue-50 text-blue-700"
        />

        <StatusCard
          title="Em andamento"
          value={inProgressOrdersCount}
          icon={<Clock3 className="h-5 w-5" />}
          className="bg-amber-50 text-amber-700"
        />

        <StatusCard
          title="Concluídas"
          value={completedOrdersCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          className="bg-emerald-50 text-emerald-700"
        />

        <StatusCard
          title="Canceladas"
          value={canceledOrdersCount}
          icon={<XCircle className="h-5 w-5" />}
          className="bg-red-50 text-red-700"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Últimas ordens
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Acompanhe as ordens mais recentes.
              </p>
            </div>

            <Link
              href="/service-order"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950"
            >
              Ver todas
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                Nenhuma ordem criada ainda.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Crie sua primeira ordem de serviço para começar.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">
                        {order.code}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {order.client.name} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-slate-950">
                        {formatCurrency(Number(order.total))}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                          statusStyles[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Ações rápidas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Atalhos para as principais áreas.
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              href="/company"
              title="Empresa"
              description="Atualize dados usados no PDF."
              icon={<Building2 className="h-5 w-5" />}
            />

            <QuickAction
              href="/clients"
              title="Clientes"
              description="Cadastre e gerencie clientes."
              icon={<Users className="h-5 w-5" />}
            />

            <QuickAction
              href="/services"
              title="Serviços"
              description="Cadastre serviços e valores."
              icon={<Wrench className="h-5 w-5" />}
            />

            <QuickAction
              href="/service-order"
              title="Ordens de serviço"
              description="Crie e exporte ordens em PDF."
              icon={<FileText className="h-5 w-5" />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <strong className="mt-3 block text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </strong>

          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-2xl p-2.5 ${className}`}>{icon}</div>
      </div>

      <strong className="mt-4 block text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </strong>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
    </Link>
  );
}