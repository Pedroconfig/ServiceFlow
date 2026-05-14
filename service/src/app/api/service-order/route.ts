import { getCurrentUser } from "../../lib/authhelper";
import { prisma } from "../../lib/prisma";
import { createServiceOrderSchema } from "../../validations/service-order";

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
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: {
      companyId: user.company.id,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(serviceOrders);
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

  const result = createServiceOrderSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const client = await prisma.client.findFirst({
    where: {
      id: result.data.clientId,
      companyId: user.company.id,
    },
    select: {
      id: true,
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

  const serviceIds = result.data.items.map((item) => item.serviceId);
  const uniqueServiceIds = [...new Set(serviceIds)];

  const services = await prisma.service.findMany({
    where: {
      id: {
        in: uniqueServiceIds,
      },
      companyId: user.company.id,
    },
  });

  if (services.length !== uniqueServiceIds.length) {
    return Response.json(
      {
        message: "Um ou mais serviços não foram encontrados.",
      },
      { status: 400 }
    );
  }

  const serviceMap = new Map(services.map((service) => [service.id, service]));

  let total = 0;

  const itemsToCreate = result.data.items.map((item) => {
    const service = serviceMap.get(item.serviceId);

    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    const unitPrice = Number(service.price);
    const subtotal = unitPrice * item.quantity;

    total += subtotal;

    return {
      serviceId: service.id,
      serviceName: service.name,
      quantity: item.quantity,
      unitPrice: unitPrice.toFixed(2),
      subtotal: subtotal.toFixed(2),
    };
  });

  const serviceOrder = await prisma.$transaction(async (tx) => {
    const serviceOrderCount = await tx.serviceOrder.count({
      where: {
        companyId: user.company!.id,
      },
    });

    const code = `OS-${String(serviceOrderCount + 1).padStart(5, "0")}`;

    return tx.serviceOrder.create({
      data: {
        code,
        description: emptyStringToNull(result.data.description),
        total: total.toFixed(2),
        companyId: user.company!.id,
        clientId: result.data.clientId,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
      },
    });
  });

  return Response.json(serviceOrder, { status: 201 });
}
