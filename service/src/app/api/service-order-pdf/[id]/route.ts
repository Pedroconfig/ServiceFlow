import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/src/app/lib/authhelper";
import { prisma } from "@/src/app/lib/prisma";
import { ServiceOrderDocument } from "@/src/app/components/service-order-document";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  console.log("ENTROU NA ROTA SERVICE-ORDER-PDF");
  console.log("COOKIE:", request.headers.get("cookie"));

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

  console.log("ID DA OS:", id);
  console.log("COMPANY DO USER:", user.company.id);

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

  console.log("SERVICE ORDER ENCONTRADA:", serviceOrder);

  if (!serviceOrder) {
    return Response.json(
      {
        message: "Ordem de serviço não encontrada.",
      },
      { status: 404 }
    );
  }

  type PdfDocumentElement = Parameters<typeof renderToBuffer>[0];

  const pdfDocument = createElement(ServiceOrderDocument, {
    order: serviceOrder,
  }) as unknown as PdfDocumentElement;

  const pdfBuffer = await renderToBuffer(pdfDocument);

  const pdfBytes = Uint8Array.from(pdfBuffer);

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${serviceOrder.code}.pdf"`,
    },
  });
}