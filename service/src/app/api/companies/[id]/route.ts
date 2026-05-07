import { prisma } from "../../../lib/prisma";
import { updateCompanySchema } from "@/src/app/validations/company";
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const company = await prisma.company.findUnique({
    where: {
      id,
    },
  });
  if (!company) {
    return Response.json(
      {
        message: "empresa não encontrada",
      },
      {
        status: 404,
      }
    );
  }
  return Response.json(company);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const result = updateCompanySchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "dadso inválidos", erros: result.error.flatten() },
      { status: 400 }
    );
  }

  const companyExists = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!companyExists) {
    return Response.json(
      {
        message: "empresa não encontrada",
      },
      {
        status: 404,
      }
    );
  }

  const data = {
    ...(result.data.name !== undefined && { name: result.data.name }),
    ...(result.data.document !== undefined && {
      document: result.data.document,
    }),
    ...(result.data.email !== undefined && {
      email: result.data.email === "" ? null : result.data.email,
    }),
    ...(result.data.phone !== undefined && { phone: result.data.phone }),
    ...(result.data.logoUrl !== undefined && { logoUrl: result.data.logoUrl }),
    ...(result.data.address !== undefined && { address: result.data.address }),
  };

  const company = await prisma.company.update({
    where: {
      id,
    },
    data,
  });
  return Response.json(company);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const companyExists = await prisma.company.findUnique({
    where: {
      id,
    },
  });
  if (!companyExists) {
    return Response.json(
      {
        message: "empresa não encontrada",
      },
      {
        status: 404,
      }
    );
  }
  await prisma.company.delete({
    where: {
      id,
    },
  });
  return Response.json(
    {
      message: "empresa deletado com sucesso",
    },
    {
      status: 200,
    }
  );
}
