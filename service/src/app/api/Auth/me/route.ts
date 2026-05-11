import { getCurrentUser } from "@/src/app/lib/authhelper";
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      {
        msg: "não autenticado.",
      },
      { status: 401 }
    );
  }

  return Response.json({
    user,
  });
}
