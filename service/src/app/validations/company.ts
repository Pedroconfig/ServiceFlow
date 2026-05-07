import {  z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2, "nome da empresa é obrigatório"),
  document: z.string().optional(),
  email: z.string().email("e-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "envie pelo menos um campo para tualizar",
  });

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;


//  enum Comida {
//     APROVADO="aporvado",
//     REPROVADO="reprovado",
//     ANDANDO="ANDANDO",
// }

//  function Eu(params:Comida) {
//     console.log(`status atual${params}`)
// }
// Eu(Comida.ANDANDO)

