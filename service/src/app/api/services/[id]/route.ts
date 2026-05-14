import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "../../../lib/prisma";
import { updateServiceSchema } from "@/src/app/validations/service";

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
export async function GET(_request: Request, context: RouteContext) {
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

  const service = await prisma.service.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
  });

  if (!service) {
    return Response.json(
      {
        message: "Serviço não encontrado.",
      },
      { status: 404 }
    );
  }

  return Response.json(service);
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

  const result = updateServiceSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const serviceExists = await prisma.service.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    select: {
      id: true,
    },
  });

  if (!serviceExists) {
    return Response.json(
      {
        message: "Serviço não encontrado.",
      },
      { status: 404 }
    );
  }

  const updatedService = await prisma.service.update({
    where: {
      id,
    },
    data: {
      ...(result.data.name !== undefined && {
        name: result.data.name,
      }),
      ...(result.data.description !== undefined && {
        description: emptyStringToNull(result.data.description),
      }),
      ...(result.data.price !== undefined && {
        price: String(result.data.price),
      }),
    },
  });

  return Response.json(updatedService);
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

  const service = await prisma.service.findFirst({
    where: {
      id,
      companyId: user.company.id,
    },
    select: {
      id: true,
    },
  });

  if (!service) {
    return Response.json(
      {
        message: "Serviço não encontrado.",
      },
      { status: 404 }
    );
  }

  await prisma.service.delete({
    where: {
      id,
    },
  });

  return Response.json({
    message: "Serviço deletado com sucesso.",
  });
}
