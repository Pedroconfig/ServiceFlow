import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "../../../lib/prisma";
import { updateClientSchema } from "@/src/app/validations/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function emptyStringToNull(value: string | undefined) {
  if (value === undefined || value === "") {
    return null;
  }

  return value;
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      {
        message: "not authenticated",
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
  const { id } = await context.params;
  const client = await prisma.client.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    include: {
      serviceOrders: {
        select: {
          id: true,
          code: true,
          status: true,
          total: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  if (!client) {
    return Response.json(
      {
        message: "Cliente não encontrado.",
      },
      { status: 404 }
    );
  }
  return Response.json(client);
}

export async function PATCH(request: Request, context: RouteContext) {
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
  const { id } = await context.params;
  const body = await request.json();

  const result = updateClientSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const clientExists = await prisma.client.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    select: {
      id: true,
    },
  });

  if (!clientExists) {
    return Response.json(
      {
        message: "Cliente não encontrado.",
      },
      { status: 404 }
    );
  }

  const updatedClient = await prisma.client.update({
    where: {
      id,
    },
    data: {
      ...(result.data.name !== undefined && {
        name: result.data.name,
      }),
      ...(result.data.document !== undefined && {
        document: emptyStringToNull(result.data.document),
      }),
      ...(result.data.email !== undefined && {
        email: emptyStringToNull(result.data.email),
      }),
      ...(result.data.phone !== undefined && {
        phone: emptyStringToNull(result.data.phone),
      }),
      ...(result.data.address !== undefined && {
        address: emptyStringToNull(result.data.address),
      }),
    },
  });

  return Response.json(updatedClient);
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  const client = await prisma.client.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    select: {
      id: true,
      serviceOrders: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!client) {
    return Response.json(
      {
        message: "Cliente não encontrado.",
      },
      { status: 404 }
    );
  }

  if (client.serviceOrders.length > 0) {
    return Response.json(
      {
        message:
          "Este cliente possui ordens de serviço vinculadas e não pode ser deletado.",
      },
      { status: 409 }
    );
  }

  await prisma.client.delete({
    where: {
      id,
    },
  });

  return Response.json({
    message: "Cliente deletado com sucesso.",
  });
}
