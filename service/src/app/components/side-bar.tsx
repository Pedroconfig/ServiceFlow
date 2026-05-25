"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
} from "lucide-react";

type AppSideBarProps = {
  userName: string;
  companyName: string;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Empresa",
    href: "/company",
    icon: Building2,
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Serviços",
    href: "/services",
    icon: Wrench,
  },
  {
    label: "Ordens",
    href: "/service-order",
    icon: FileText,
  },
];

export function AppSidebar({ userName, companyName }: AppSideBarProps) {
  const pathName = usePathname();
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/Auth/logout", {
      method: "POST",
    });
    router.push("/login");
    router.refresh();
  }
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white px-4 py-5 md:flex md:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          SF
        </div>

        <div>
          <h1 className="text-base font-bold text-slate-950">ServiceFlow</h1>
          <p className="text-xs text-slate-500">Ordens de serviço</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathName === item.href || pathName.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500">Conta ativa</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-950">
          {userName}
        </p>
        <p className="truncate text-xs text-slate-500">{companyName}</p>

        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
