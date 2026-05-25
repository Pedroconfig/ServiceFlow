import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/app/lib/authhelper";


export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
