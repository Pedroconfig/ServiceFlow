import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "../../../../lib/prisma";
import { ServiceOrderDocument } from "@/src/app/components/service-order-document";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
    console.log("COOKIE NA ROTA PDF:", request.headers.get("cookie"));

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
    include: {
      company: {
        select: {
          name: true,
          document: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      client: {
        select: {
          name: true,
          document: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      items: {
        select: {
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

  const pdfBuffer = await renderToBuffer(
    <ServiceOrderDocument order={serviceOrder} />
  );

  const pdfBytes = Uint8Array.from(pdfBuffer);

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${serviceOrder.code}.pdf"`,
    },
  });
}
