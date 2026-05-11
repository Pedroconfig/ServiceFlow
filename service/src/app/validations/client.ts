import { z } from "zod";


export const createClientSchema = z.object({
  name: z.string().min(2, "o nome do cliente é obrigatório"),
  document: z.string().optional(),
  email: z.string().email("email inválido").optional().or(z.literal(" ")),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyId: z.string().min(1, "a empresa é obrigatória"),
});

export const updateClientSchema = createClientSchema
  .omit({ companyId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "envie pelo menos um campo",
  });

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
