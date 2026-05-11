import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const AUTH_COOCKIE_NAME = "service_flow_token";

type AuthTokenPayload = {
  userId: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não foi encontrado!");
  }
  return new TextEncoder().encode(secret);
}

export async function createAuthToken(payload: AuthTokenPayload) {
  const secret = getJwtSecret();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function VerifyAuthToken(token: string) {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify<AuthTokenPayload>(token, secret);
  return payload;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOCKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOCKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOCKIE_NAME)?.value;

  if (!token) {
    return null;
  }
  try {
    const payload = await VerifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
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
    return user;
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser;
  if (!user) {
    throw new Error("UNAUTHORAIZED!");
  }
  return user;
}
