import * as yup from "yup";

export const editUserSchema = yup.object().shape({
   name: yup.string().nullable().optional(),

   email: yup
      .string()
      .nullable()
      .email("Email deve ter um formato válido")
      .optional(),

   password: yup
   .string()
   .nullable()
   .transform((value) => {
      const trimmed = value?.trim();
      return trimmed || null;
   })
   .min(6, "Senha deve ter no mínimo 6 caracteres")
   .optional(),

   cpf: yup
      .string()
      .nullable()
      .matches(
         /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
         "CPF deve ter um formato válido",
      )
      .optional(),

   phone: yup
      .string()
      .nullable()
      .matches(
         /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/,
         "Telefone deve ter um formato válido",
      )
      .optional(),

   dateOfBirth: yup
      .string()
      .nullable()
      .matches(
         /^\d{4}-\d{2}-\d{2}$/,
         "Data de nascimento deve estar no formato YYYY-MM-DD",
      )
      .optional(),

   gender: yup
      .string()
      .nullable()
      .oneOf([null, "Homem", "Mulher"], 'Gênero deve ser "Homem" ou "Mulher"')
      .optional(),

   zipCode: yup
      .string()
      .nullable()
      .matches(/^\d{5}-?\d{3}$/, "CEP deve ter um formato válido")
      .optional(),

   address: yup
      .string()
      .nullable()
      .min(5, "Rua deve ter no mínimo 5 caracteres")
      .optional(),

   number: yup.string().nullable().optional(),

   neighborhood: yup
      .string()
      .nullable()
      .min(3, "Bairro deve ter no mínimo 3 caracteres")
      .optional(),

   city: yup
      .string()
      .nullable()
      .min(2, "Cidade deve ter no mínimo 2 caracteres")
      .optional(),

   state: yup
      .string()
      .nullable()
      .length(2, "Estado deve ter 2 caracteres")
      .optional(),

   admissionDate: yup
      .string()
      .nullable()
      .matches(
         /^\d{4}-\d{2}-\d{2}$/,
         "Data de admissão deve estar no formato YYYY-MM-DD",
      )
      .optional(),

   Cbo: yup.string().nullable().optional(),

   startingSalary: yup
      .number()
      .nullable()
      .positive("Salário inicial deve ser um valor positivo")
      .optional(),

   natureOfThePosition: yup.string().nullable().optional(),

   sector: yup.string().nullable().optional(),

   paymentMethod: yup.string().nullable().optional(),

   initialHour: yup
      .string()
      .nullable()
      .matches(
         /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
         "Hora inicial deve estar no formato HH:MM",
      )
      .optional(),

   finalHour: yup
      .string()
      .nullable()
      .matches(
         /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
         "Hora final deve estar no formato HH:MM",
      )
      .optional(),

   lunchInitialHour: yup
      .string()
      .nullable()
      .matches(
         /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
         "Hora inicial do almoço deve estar no formato HH:MM",
      )
      .optional(),

   lunchFinalHour: yup
      .string()
      .nullable()
      .matches(
         /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
         "Hora final do almoço deve estar no formato HH:MM",
      )
      .optional(),

   daysOfWork: yup.array().nullable().optional(),
});

export default editUserSchema;
