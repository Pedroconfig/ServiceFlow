import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { createAuthToken, setAuthCookie } from "@/src/app/lib/authhelper";
import { loginScema } from "@/src/app/validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const result = loginScema.safeParse(body);

  if (!result.success)
    return Response.json(
      {
        msg: "Dados inválidos",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );

  const email = result.data.email.toLocaleLowerCase();
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return Response.json(
      {
        msg: "E-mail ou senha inválidos.",
      },
      {
        status: 401,
      }
    );
  }
  const passworIsValid = await bcrypt.compare(
    result.data.password,
    user.passwordHash
  );
  if (!passworIsValid) {
    return Response.json(
      {
        msg: "E-mail ou senha inválidos.",
      },
      { status: 401 }
    );
  }

  const token = await createAuthToken({
    userId: user.id,
  });

  await setAuthCookie(token);

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
    },
  });
}
