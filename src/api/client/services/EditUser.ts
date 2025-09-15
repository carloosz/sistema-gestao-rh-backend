const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import { RegisterUserDTO } from "../dto/RegisterUserDTO";
import  editUserSchema from "../validation/EditUserSchema";

import * as yup from 'yup';
import timeStringToDate from "./RegisterUser";

class EditUser {

    async editUser(ctx) {
        return strapi.db.transaction(async (trx) => {
            try {

                const { id } : { id: string } = ctx.request.params;

                const data : RegisterUserDTO = await editUserSchema.validate(
                    ctx.request.body,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                )

                const existingUser = await strapi.documents(
                    'plugin::users-permissions.user'
                ).findFirst({
                    filters: {
                        documentId: {
                            $ne: id 
                        },
                        $or: [
                            {
                                email: data.email
                            },
                            {
                                client: {
                                    cpf: data.cpf
                                }
                            }
                        ]
                    }
                })

                if (existingUser) {
                    throw new ApplicationError('Dados já cadastrados, não é possível editar')
                }

                const user = await strapi.documents(
                    'plugin::users-permissions.user'
                ).findFirst({
                    filters: {
                        client: {
                            documentId: id
                        }
                    },
                    populate: {
                        client: {
                            populate: {
                                professional_data: {
                                    populate: {
                                        days_of_work: true
                                    }
                                }
                            }
                        }
                    }
                })

                if (!user) {
                    throw new ApplicationError('Colaborador não encontrado')
                }

                await strapi.documents(
                    'plugin::users-permissions.user'
                ).update({
                    documentId: user.documentId,
                    data: {
                        email: data.email ?? user.email,
                        password: data.password ?? user.password,
                    }
                })

                await strapi.documents(
                    'api::client.client'
                ).update({
                    documentId: user.client.documentId,
                    data: {
                        name: data.name ?? user.client.name,
                        cpf: data.cpf ?? user.client.cpf,
                        phone: data.phone ?? user.client.phone,
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : user.client.dateOfBirth,
                        gender: data.gender as any ?? user.client.gender,
                        zipCode: data.zipCode ?? user.client.zipCode,
                        address: data.address ?? user.client.address,
                        number: data.number ?? user.client.number,
                        neighborhood: data.neighborhood ?? user.client.neighborhood,
                        city: data.city ?? user.client.city,
                        state: data.state ?? user.client.state
                    }
                })

                await strapi.documents(
                    'api::professional-data.professional-data'
                ).update({
                    documentId: user.client.professional_data?.documentId,
                    data: {
                        admissionDate: data.admissionDate ? new Date(data.admissionDate) : user.client.professional_data?.admissionDate,
                        natureOfThePosition: data.natureOfThePosition ?? user.client.professional_data?.natureOfThePosition,
                        sector: data.sector ?? user.client.professional_data?.sector,
                        Cbo: data.Cbo ?? user.client.professional_data?.Cbo,
                        startingSalary: data.startingSalary ?? user.client.professional_data?.startingSalary,
                        paymentMethod: data.paymentMethod ?? user.client.professional_data?.paymentMethod,
                        initialHour: data.initialHour ? timeStringToDate(data.initialHour) : user.client.professional_data?.initialHour,
                        finalHour: data.finalHour ? timeStringToDate(data.finalHour) : user.client.professional_data?.finalHour,
                        lunchInitialHour: data.lunchInitialHour ? timeStringToDate(data.lunchInitialHour) : user.client.professional_data?.lunchInitialHour,
                        lunchFinalHour: data.lunchFinalHour ? timeStringToDate(data.lunchFinalHour) : user.client.professional_data?.lunchFinalHour,
                        days_of_work: data.daysOfWork
                    }
                })

                return await strapi.documents(
                    'plugin::users-permissions.user'
                ).findOne({
                    documentId: user.documentId,
                    populate: {
                        client: {
                            populate: {
                                professional_data: {
                                    populate: {
                                        days_of_work: true
                                    }
                                }
                            }
                        }
                    }
                })

            } catch (err) {

                if (err instanceof yup.ValidationError) {
                    console.log('Erros do Yup custom:', err.errors);
                    throw new ApplicationError(err.errors);
                }

                console.log(err);
                throw new ApplicationError('Erro ao editar colaborador')
            }
        })
    }

}

export { EditUser }