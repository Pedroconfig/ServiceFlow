// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// type CurrentUser = {
//   id: string;
//   name: string;
//   email: string;
//   company: {
//     id: string;
//     name: string;
//   } | null;
// };

// export default function DashboardPage() {
//   const router = useRouter();
//   const [user, setUser] = useState<CurrentUser | null>(null);
//   const [isLoading, seTiSloading] = useState(true);

//   useEffect(() => {
//     async function loadCurrentUser() {
//       const response = await fetch("/api/Auth/me");
//       if (!response.ok) {
//         router.push("/login");
//         return;
//       }
//       const data = await response.json();
//       setUser(data.user);
//       seTiSloading(false);
//     }

//     loadCurrentUser();
//   }, [router]);

//   async function handleLogout() {
//     await fetch("/api/Auth/logout", {
//       method: "POST",
//     });
//     router.push("/login");
//   }

//   if (isLoading) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-zinc-100">
//         <p className="text-sm text-zinc-600">Carregando...</p>
//       </main>
//     );
//   }
//   return (
//     <main className="min-h-screen bg-zinc-100">
//       <header className="border-b bg-white">
//         <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
//           <div>
//             <h1 className="text-xl font-bold text-zinc-900">ServiceFlow</h1>
//             <p className="text-sm text-zinc-500">Gestão de ordens de serviço</p>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
//           >
//             Sair
//           </button>
//         </div>
//       </header>

//       <section className="mx-auto max-w-6xl px-6 py-8">
//         <div className="rounded-2xl bg-white p-6 shadow-sm">
//           <h2 className="text-2xl font-bold text-zinc-900">
//             Bem-vindo, {user?.name}
//           </h2>

//           <p className="mt-2 text-zinc-600">
//             Empresa atual:{" "}
//             <strong className="text-zinc-900">
//               {user?.company?.name ?? "Empresa não encontrada"}
//             </strong>
//           </p>
//         </div>

//         <div className="mt-6 grid gap-4 md:grid-cols-4">
//           <a
//             href="/clients"
//             className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
//           >
//             <h3 className="font-bold text-zinc-900">Clientes</h3>
//             <p className="mt-2 text-sm text-zinc-600">
//               Cadastre e gerencie clientes da empresa.
//             </p>
//           </a>

//           <a
//             href="/services"
//             className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
//           >
//             <h3 className="font-bold text-zinc-900">Serviços</h3>
//             <p className="mt-2 text-sm text-zinc-600">
//               Cadastre serviços e valores para usar nas ordens.
//             </p>
//           </a>

//           <a
//             href="/service-order"
//             className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
//           >
//             <h3 className="font-bold text-zinc-900">Ordens de serviço</h3>
//             <p className="mt-2 text-sm text-zinc-600">
//               Crie, acompanhe e gere PDFs das ordens.
//             </p>
//           </a>

//           <a
//             href="/company"
//             className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
//           >
//             <h3 className="font-bold text-zinc-900">Empresa</h3>
//             <p className="mt-2 text-sm text-zinc-600">
//               Atualize dados comerciais usados nas ordens de serviço.
//             </p>
//           </a>
//         </div>
//       </section>
//     </main>
//   );
// }

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "@/src/app/lib/prisma";
import LogoutButton from "../../components/logout-button";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

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
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">ServiceFlow</h1>
            <p className="text-sm text-zinc-500">Gestão de ordens de serviço</p>
          </div>

          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900">
            Bem-vindo, {user.name}
          </h2>

          <p className="mt-2 text-zinc-600">
            Empresa atual:{" "}
            <strong className="text-zinc-900">{user.company.name}</strong>
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Clientes</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {clientsCount}
            </strong>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Serviços</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {servicesCount}
            </strong>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Ordens</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {serviceOrdersCount}
            </strong>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Valor total</p>
            <strong className="mt-2 block text-2xl text-zinc-900">
              {formatCurrency(totalRevenue)}
            </strong>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Abertas</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {openOrdersCount}
            </strong>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Em andamento</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {inProgressOrdersCount}
            </strong>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Concluídas</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {completedOrdersCount}
            </strong>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Canceladas</p>
            <strong className="mt-2 block text-3xl text-zinc-900">
              {canceledOrdersCount}
            </strong>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900">Últimas ordens</h3>

            {recentOrders.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                <p className="text-sm text-zinc-600">
                  Nenhuma ordem de serviço criada ainda.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {order.code}
                      </p>

                      <p className="mt-1 text-sm text-zinc-600">
                        Cliente: {order.client.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Criada em {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-zinc-900">
                        {formatCurrency(Number(order.total))}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900">Ações rápidas</h3>

            <div className="mt-6 space-y-3">
              <Link
                href="/company"
                className="block rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
              >
                <h4 className="font-semibold text-zinc-900">Empresa</h4>
                <p className="mt-1 text-sm text-zinc-600">
                  Atualize os dados usados no PDF.
                </p>
              </Link>

              <Link
                href="/clients"
                className="block rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
              >
                <h4 className="font-semibold text-zinc-900">Clientes</h4>
                <p className="mt-1 text-sm text-zinc-600">
                  Cadastre e gerencie clientes.
                </p>
              </Link>

              <Link
                href="/services"
                className="block rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
              >
                <h4 className="font-semibold text-zinc-900">Serviços</h4>
                <p className="mt-1 text-sm text-zinc-600">
                  Cadastre serviços e valores.
                </p>
              </Link>

              <Link
                href="/service-order"
                className="block rounded-xl border border-zinc-200 p-4 transition hover:bg-zinc-50"
              >
                <h4 className="font-semibold text-zinc-900">
                  Ordens de serviço
                </h4>
                <p className="mt-1 text-sm text-zinc-600">
                  Crie e exporte ordens em PDF.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
