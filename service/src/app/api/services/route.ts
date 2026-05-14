
import { getCurrentUser } from "../../lib/authhelper";
import { prisma } from "../../lib/prisma";
import { createServiceSchema } from "../../validations/service";

function emptyStringToNull(value: string | undefined) {
  if (value === undefined || value === "") {
    return null;
  }
  return value;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        message: "Não autenticado",
      },
      { status: 401 }
    );
  }
  if (!user.company) {
    return Response.json(
      {
        message: "Empresa não encontrada para este usuário",
      },
      { status: 404 }
    );
  }

  const service = await prisma.service.findMany({
    where: {
      companyId: user.company.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return Response.json(service);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      {
        message: "Não autenticado.",
      },
      { status: 401 }
    );
  }

  if (!user.company) {
    return Response.json(
      {
        message: "Empresa não encontrada para este usuário.",
      },
      { status: 404 }
    );
  }
  const body = await request.json();
  const result = createServiceSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: {
      name: result.data.name,
      description: emptyStringToNull(result.data.description),
      price: String(result.data.price),
      companyId: user.company.id,
    },
  });
  return Response.json(service, { status: 201 });
}
