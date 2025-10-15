import * as yup from "yup";

export const createRequestSchema = yup.object({
   type: yup
      .string()
      .oneOf(
         ["Reclamacao", "Duvida", "Sugestao"],
         "Tipo deve ser Reclamacao, Duvida ou Sugestao",
      )
      .required("Tipo é obrigatório"),

   observation: yup.string().required("Observação é obrigatória"),
});

export type CreateRequestDTO = yup.InferType<typeof createRequestSchema>;

export default createRequestSchema;
