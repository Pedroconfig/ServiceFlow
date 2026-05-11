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

export type RegisterInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginScema>;
