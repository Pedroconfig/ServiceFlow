import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/app/lib/authhelper";
import { AppSidebar } from "../components/side-bar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.company) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar userName={user.name} companyName={user.company.name} />

      <div className="min-h-screen md:pl-72">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
