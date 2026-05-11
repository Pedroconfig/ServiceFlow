import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "../../../lib/prisma";
import { updateCompanySchema } from "@/src/app/validations/company";

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

  const company = await prisma.company.findUnique({
    where: {
      userId: user.id,
    },
  });
  if (!company) {
    return Response.json(
      {
        msg: "Empresa não encontrada",
      },
      { status: 404 }
    );
  }

  return Response.json(company);
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      {
        msg: "Não autenticado.",
      },
      { status: 401 }
    );
  }
  const body = await request.json();
  const result = updateCompanySchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        msg: "DADOS INVÁLIDOS",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!company) {
    return Response.json(
      {
        msg: "Empresa não enocntrada",
      },
      { status: 404 }
    );
  }

   const updatedCompany = await prisma.company.update({
    where: {
      userId: user.id,
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
      ...(result.data.logoUrl !== undefined && {
        logoUrl: emptyStringToNull(result.data.logoUrl),
      }),
      ...(result.data.address !== undefined && {
        address: emptyStringToNull(result.data.address),
      }),
    },
  });

  return Response.json(updatedCompany);
}



