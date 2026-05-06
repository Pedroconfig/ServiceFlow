import { prisma } from "../../lib/prisma";

export async function GET() {
  const companyCount = await prisma.company.count();

  return Response.json({
    status:"ok",
    database:"connected",
    companyCount
  })
}
