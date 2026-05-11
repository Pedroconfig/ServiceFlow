import { clearAuthCookie } from "@/src/app/lib/authhelper";
export async function POST() {
  await clearAuthCookie();
  return Response.json({
    msg: "Logout realizado com sucesso.",
  });
}
