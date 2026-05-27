import bcrypt from "bcryptjs";
import { prisma } from "@/src/app/lib/prisma";
import { hashPasswordResetToken } from "@/src/app/lib/password-reset";
import { resetPasswordSchema } from "@/src/app/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();

  const result = resetPasswordSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const tokenHash = hashPasswordResetToken(result.data.token);

  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!passwordResetToken) {
    return Response.json(
      {
        message: "Token inválido ou expirado.",
      },
      { status: 400 }
    );
  }

  if (passwordResetToken.usedAt) {
    return Response.json(
      {
        message: "Token inválido ou expirado.",
      },
      { status: 400 }
    );
  }

  if (passwordResetToken.expiresAt < new Date()) {
    return Response.json(
      {
        message: "Token inválido ou expirado.",
      },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(result.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: passwordResetToken.user.id,
      },
      data: {
        passwordHash,
      },
    }),

    prisma.passwordResetToken.update({
      where: {
        id: passwordResetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  return Response.json({
    message: "Senha redefinida com sucesso.",
  });
}