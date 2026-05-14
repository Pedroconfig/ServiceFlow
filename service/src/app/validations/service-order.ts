import { z } from "zod";

export const createServiceOrderSchema = z.object({
  clientId: z.string().min(1, "O cliente é obrigatório."),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        serviceId: z.string().min(1, "O serviço é obrigatório."),
        quantity: z.coerce
          .number()
          .int("A quantidade precisa ser um número inteiro.")
          .positive("A quantidade precisa ser maior que zero."),
      })
    )
    .min(1, "A ordem precisa ter pelo menos um item."),
});

export const updateServiceOrderSchema = z
  .object({
    description: z.string().optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie pelo menos um campo para atualizar.",
  });

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
export type UpdateServiceOrderInput = z.infer<typeof updateServiceOrderSchema>;
