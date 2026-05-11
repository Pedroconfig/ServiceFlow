import { prisma } from "../../lib/prisma";
import { createClientSchema } from "../../validations/client";

function emptyStringToNull(value: string | undefined) {
  if (value === undefined || value === "") {
    return null;
  }

  return value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  const clients = await prisma.client.findMany({
    where: companyId
      ? {
          companyId,
        }
      : undefined,
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return Response.json(clients);
}
export async function POST(request: Request) {
  const body = await request.json();
  const result = createClientSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "dados inválidos",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const commpanyExists = await prisma.company.findUnique({
    where: {
      id: result.data.companyId,
    },
    select: {
      id: true,
    },
  });
  if (!commpanyExists) {
    return Response.json(
      {
        message: "empresa não encontrado",
      },
      { status: 404 }
    );
  }
  const client = await prisma.client.create({
    data: {
      name: result.data.name,
      document: emptyStringToNull(result.data.document),
      email: emptyStringToNull(result.data.email),
      phone: emptyStringToNull(result.data.phone),
      address: emptyStringToNull(result.data.address),
      companyId: result.data.companyId,
    },
  });
  return Response.json(client, { status: 201 });
}
