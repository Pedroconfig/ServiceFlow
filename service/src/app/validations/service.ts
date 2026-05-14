import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2, " o nome do serviço é obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().positive("o preço precisa ser maior que zero"),
});

export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie pelo menos um campo para atualizar.",
  });
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
