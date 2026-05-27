import { sendPasswordResetEmail } from "@/src/app/lib/mail";
import { prisma } from "../../../lib/prisma";
import {
  generatePasswordResetToken,
  getPasswordResetExpirationDate,
  hashPasswordResetToken,
} from "@/src/app/lib/password-reset";
import { forgotPasswordSchema } from "@/src/app/validations/auth";


export async function POST(request: Request) {
  const body = await request.json();
  const result = forgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        message: "dados inválidos",
        erros: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const email = result.data.email.toLocaleLowerCase();
  const genericMessage =
    "se este e-mail existir , eviaremos intruções para redefinir a senha";

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
    },
  });
  if (!user) {
    return Response.json({
      message: genericMessage,
    });
  }
  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = getPasswordResetExpirationDate();

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL não foi definida");
  }
  const resetUrl = `${appUrl}/reset-password?rtoken=${rawToken}`;
  await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
  });

  return Response.json({
    message: genericMessage,
  });
}
