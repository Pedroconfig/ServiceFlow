import crypto from "crypto";
export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpirationDate() {
  const expiresAt = new Date();

  expiresAt.setMinutes(expiresAt.getMinutes() + 30);

  return expiresAt;
}
