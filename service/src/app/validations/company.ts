import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2, "nome da empresa é obrigatório"),
  document: z.string().optional(),
  email: z.string().email("e-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
