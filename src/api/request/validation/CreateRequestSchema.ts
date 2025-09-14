import * as yup from 'yup'; 

const createRequestSchema = yup.object().shape({
    type: yup
        .string()
        .oneOf(['Reclamacao', 'Sugestao', 'Duvida'], 'Tipo deve ser Reclamacao, Sugestao ou Duvida')
        .required('Tipo é obrigatório'),

    observation: yup
        .string()
        .required('Observação é obrigatória'),
});

export default createRequestSchema;