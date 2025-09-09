const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import { RegisterUserDTO } from "../dto/RegisterUserDTO";
import  RegisterUserSchema from "../validation/RegisterUserSchema";

import * as yup from 'yup';

function timeStringToDate(
  timeString: string, 
  baseYear: number = 2025, 
  baseMonth: number = 1, 
  baseDay: number = 1
): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date(baseYear, baseMonth - 1, baseDay, hours, minutes);
}

class RegisterUser {

    async registerUser (ctx) {
        return strapi.db.transaction(async (trx) => {
            try {

                let data : RegisterUserDTO = await RegisterUserSchema.validate(
                    ctx.request.body,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                )

                const user = await strapi.documents(
                    'plugin::users-permissions.user'
                ).create({
                    data: {
                        username: data.email,
                        email: data.email,
                        password: data.password,
                        role: 1,
                        blocked: false,
                        confirmed: true,
                        provider: 'local'
                    }
                })

                const client = await strapi.documents(
                    'api::client.client'
                ).create({
                    data:{
                        name: data.name,
                        cpf: data.cpf,
                        phone: data.phone,
                        dateOfBirth: new Date(data.dateOfBirth),
                        gender: data.gender as 'Homem' | 'Mulher',
                        zipCode: data.zipCode,
                        address: data.address,
                        number: data.number,
                        neighborhood: data.neighborhood,
                        city: data.city,
                        state: data.state,
                        user: user.documentId
                    }
                })

                const professionalData = await strapi.documents(
                    'api::professional-data.professional-data'
                ).create({
                    data: {
                        admissionDate: new Date(data.admissionDate),
                        Cbo: data.Cbo,
                        startingSalary: data.startingSalary,
                        natureOfThePosition: data.natureOfThePosition,
                        sector: data.sector,
                        paymentMethod: data.paymentMethod,
                        initialHour: timeStringToDate(data.initialHour),
                        finalHour: timeStringToDate(data.finalHour),
                        lunchInitialHour: timeStringToDate(data.lunchInitialHour),
                        lunchFinalHour: timeStringToDate(data.lunchFinalHour),
                        client: client.documentId,
                        days_of_work: data.daysOfWork.length > 0 ? data.daysOfWork : null
                    }
                })

                return client

            } catch (err) {

                console.log(err)

                if (err instanceof yup.ValidationError) {
                    console.log('Erros do Yup custom:', err.errors);
                    throw new ApplicationError(err.errors);
                }

                throw new ApplicationError(
                    err instanceof ApplicationError ? err.message : 'Erro ao cadastrar usuário, tente novamente mais tarde'
                )
            }
        })
    }

}

export { RegisterUser }