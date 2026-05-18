import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "../../../lib/prisma";
import { updateServiceOrderSchema } from "@/src/app/validations/service-order";

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
        message: "Não autenticado",
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

  const serviceOrder = await prisma.serviceOrder.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          document: true,
          email: true,
          phone: true,
          logoUrl: true,
          address: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          document: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      items: {
        select: {
          id: true,
          serviceId: true,
          serviceName: true,
          quantity: true,
          unitPrice: true,
          subtotal: true,
        },
      },
    },
  });

  if (!serviceOrder) {
    return Response.json(
      {
        message: "Ordem de serviço não encontrada.",
      },
      { status: 404 }
    );
  }
  return Response.json(serviceOrder);
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

  const result = updateServiceOrderSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const serviceOrderExists = await prisma.serviceOrder.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    select: {
      id: true,
    },
  });

  if (!serviceOrderExists) {
    return Response.json(
      {
        message: "Ordem de serviço não encontrada.",
      },
      { status: 404 }
    );
  }

  const updatedServiceOrder = await prisma.serviceOrder.update({
    where: {
      id,
    },
    data: {
      ...(result.data.description !== undefined && {
        description: emptyStringToNull(result.data.description),
      }),
      ...(result.data.status !== undefined && {
        status: result.data.status,
      }),
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      items: true,
    },
  });

  return Response.json(updatedServiceOrder);
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

  const serviceOrder = await prisma.serviceOrder.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    select: {
      id: true,
    },
  });

  if (!serviceOrder) {
    return Response.json(
      {
        message: "Ordem de serviço não encontrada.",
      },
      { status: 404 }
    );
  }

  await prisma.serviceOrder.delete({
    where: {
      id,
    },
  });

  return Response.json({
    message: "Ordem de serviço deletada com sucesso.",
  });
}
