import { Resend } from "resend";

type SendPasswordResetEmailParams = {
  to: string;
  resetUrl: string;
};
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailParams) {
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL não configurado no .env");
  }
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY não encontrada");
  }
  const resend = new Resend();
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Redefinição de senha - ServiceFlow",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h1 style="font-size: 22px; color: #0f172a;">Redefinição de senha</h1>

        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta no ServiceFlow.
        </p>

        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
          Clique no botão abaixo para criar uma nova senha. Este link expira em 30 minutos.
        </p>

        <a
          href="${resetUrl}"
          style="display: inline-block; margin-top: 16px; background: #020617; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 700;"
        >
          Redefinir senha
        </a>

        <p style="margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.6;">
          Se você não solicitou essa alteração, ignore este e-mail.
        </p>
      </div>
    `,
  });
}
