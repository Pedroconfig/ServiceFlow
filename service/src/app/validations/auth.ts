import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  companyName: z.string().min(2, "O nome da empresa é obrigatório."),
});
export const loginScema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("email invalidado"),
});
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "token obrigatório"),
  password: z.string().min(6, "a senha precisa ter pelo menos 6 caracteres."),
});

export type RegisterInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginScema>;
export type ForgotInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
