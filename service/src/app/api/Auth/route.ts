import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { createAuthToken, setAuthCookie } from "../../lib/authhelper";
import { registrationSchema } from "../../validations/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const result = registrationSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        msg: "invalid data",
        errors: result.error.flatten().fieldErrors,
      },
      {
        status: 400,
      }
    );
  }

  const email = result.data.email.toLocaleLowerCase();
  const userAlreadyExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userAlreadyExists) {
    return Response.json(
      {
        msg: "Este e-mail já está em uso.",
      },
      {
        status: 409,
      }
    );
  }
  const passwordHash = await bcrypt.hash(result.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: result.data.name,
      email,
      passwordHash,
      company: {
        create: {
          name: result.data.companyName,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const token = await createAuthToken({
    userId: user.id,
  });
  await setAuthCookie(token);
  return Response.json(
    {
      user,
    },
    { status: 201 }
  );
}
