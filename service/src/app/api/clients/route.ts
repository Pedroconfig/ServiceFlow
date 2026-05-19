import { prisma } from "../../lib/prisma";
import { createClientSchema } from "../../validations/client";
import { getCurrentUser } from "../../lib/authhelper";

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
        msg: "Não autenticado",
      },
      { status: 401 }
    );
  }
  if (!user.company) {
    return Response.json(
      {
        msg: "Empresa não eocntrada para este usuário",
      },
      { status: 404 }
    );
  }

  const clients = await prisma.client.findMany({
    where: {
      companyId: user.company.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return Response.json(clients);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      {
        msg: "Não autenticado",
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
  const result = createClientSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const client = await prisma.client.create({
    data: {
      name: result.data.name,
      document: emptyStringToNull(result.data.document),
      email: emptyStringToNull(result.data.email),
      phone: emptyStringToNull(result.data.phone),
      address: emptyStringToNull(result.data.address),

      companyId: user.company.id,
    },
  });

  return Response.json(
    client,

    { status: 201 }
  );
}
