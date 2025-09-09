import * as yup from 'yup';

export const registerUserSchema = yup.object().shape({
  name : yup
    .string()
    .required('Nome é obrigatório'),

  email: yup
    .string()
    .email('Email deve ter um formato válido')
    .required('Email é obrigatório'),
    
  password: yup
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .required('Senha é obrigatória'),
    
  cpf: yup
    .string()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF deve ter um formato válido')
    .required('CPF é obrigatório'),
    
  phone: yup
    .string()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/, 'Telefone deve ter um formato válido')
    .required('Telefone é obrigatório'),
    
  dateOfBirth: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
    .required('Data de nascimento é obrigatória'),
    
  gender: yup
    .string()
    .oneOf(['Homem', 'Mulher'], 'Gênero deve ser "Homem" ou "Mulher"')
    .required('Gênero é obrigatório'),
    
  zipCode: yup
    .string()
    .matches(/^\d{5}-?\d{3}$/, 'CEP deve ter um formato válido')
    .required('CEP é obrigatório'),
    
  address: yup
    .string()
    .min(5, 'Rua deve ter no mínimo 5 caracteres')
    .required('Rua é obrigatória'),
    
  number: yup
    .string()
    .required('Número é obrigatório'),
    
  neighborhood: yup
    .string()
    .min(3, 'Bairro deve ter no mínimo 3 caracteres')
    .required('Bairro é obrigatório'),
    
  city: yup
    .string()
    .min(2, 'Cidade deve ter no mínimo 2 caracteres')
    .required('Cidade é obrigatória'),
    
  state: yup
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .required('Estado é obrigatório'),
    
  admissionDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Data de admissão deve estar no formato YYYY-MM-DD')
    .required('Data de admissão é obrigatória'),
    
  Cbo: yup
    .string()
    .required('CBO é obrigatório'),
    
  startingSalary: yup
    .number()
    .positive('Salário inicial deve ser um valor positivo')
    .required('Salário inicial é obrigatório'),

  natureOfThePosition: yup
    .string()
    .required('Natureza da posição é obrigatória'),
    
  sector: yup
    .string()
    .required('Setor é obrigatório'),
    
  paymentMethod: yup
    .string()
    .required('Método de pagamento é obrigatório'),
    
  initialHour: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inicial deve estar no formato HH:MM')
    .required('Hora inicial é obrigatória'),
    
  finalHour: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora final deve estar no formato HH:MM')
    .required('Hora final é obrigatória'),
    
  lunchInitialHour: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inicial do almoço deve estar no formato HH:MM')
    .required('Hora inicial do almoço é obrigatória'),
    
  lunchFinalHour: yup
    .string()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora final do almoço deve estar no formato HH:MM')
    .required('Hora final do almoço é obrigatória'),

  daysOfWork: yup
    .array()
    .required('Dias de trabalho é obrigatório'),
});

export default registerUserSchema;