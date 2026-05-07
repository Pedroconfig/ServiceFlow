import { prisma } from "../../lib/prisma";
import { createCompanySchema } from "../../validations/company";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return Response.json(companies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createCompanySchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "dados invalidos.",
        erros: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const company = await prisma.company.create({
    data: {
      name: result.data.name,
      document: result.data.document,
      email: result.data.email || null,
      phone: result.data.phone,
      logoUrl: result.data.logoUrl,
      address: result.data.address,
    },
  });
  return Response.json(company, { status: 201 });
}
