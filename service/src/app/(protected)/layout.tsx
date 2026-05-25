import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/app/lib/authhelper";

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

  return <>{children}</>;
}
