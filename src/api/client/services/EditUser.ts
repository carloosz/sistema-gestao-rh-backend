//imports para lancamento de erros
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

//import do schema yup para validacao dos campos
import editUserSchema from "../validation/EditUserSchema";

import * as yup from "yup";
import timeStringToDate from "./RegisterUser";

class EditUser {
   //metodo para editar o colaborador
   async editUser(ctx) {
      return strapi.db.transaction(async (trx) => {
         try {
            //pegando alguns dados importantes na requisicao
            const { id }: { id: string } = ctx.request.params;
            const userDocumentId = ctx.state.user.documentId;
            const roleId = ctx.state.user.role.id;

            //declarando id da role admin
            const ADMIN_ROLE_ID = 34;

            //usuario colaborador nao pode editar informacoes de outro usuario, somente ele mesmo
            if (id && roleId !== ADMIN_ROLE_ID) {
               throw new ApplicationError(
                  "Operação não permitida",
               );
            }

            //validando os dados recebidos com o schema yup
            const data = await editUserSchema.validate(ctx.request.body, {
               abortEarly: false,
               stripUnknown: true,
            });

            //verificando se o email ou cpf ja estao cadastrados em outro usuario
            const existingUser = await strapi
               .documents("plugin::users-permissions.user")
               .findFirst({
                  filters: {
                     client: {
                        documentId: {
                           $ne: id || 'a'
                        },
                        user: {
                           documentId: {
                              $ne: userDocumentId || 'a'
                           }
                        }
                     },
                     $or: [
                        {
                           email: data.email,
                        },
                        {
                           client: {
                              cpf: data.cpf,
                           },
                        },
                     ],
                  },
               });

               //se estiver, lanca erro
            if (existingUser) {
               throw new ApplicationError(
                  "Dados já cadastrados, não é possível editar",
               );
            }

            //achar usuario correspondente com base no id
            const user = await strapi
               .documents("plugin::users-permissions.user")
               .findFirst({
                  filters: {
                     $or : [
                        {
                           client: {
                              documentId: id || 'a',
                           }
                        },
                        {
                           documentId: userDocumentId || 'a',
                           role: {
                              id: {
                                 $ne: ADMIN_ROLE_ID
                              }
                           }
                        }
                     ]
                  },
                  populate: {
                     client: {
                        populate: {
                           professional_data: {
                              populate: {
                                 days_of_work: true,
                              },
                           },
                        },
                     },
                  },
               });

            if (!user) {
               throw new ApplicationError("Colaborador não encontrado");
            }

            //atualizando informacoes
            await strapi.documents("plugin::users-permissions.user").update({
               documentId: user.documentId,
               data: {
                  username: data.email ?? user.email,
                  email: data.email ?? user.email,
                  password: data.password,
               },
            });

            await strapi.documents("api::client.client").update({
               documentId: user.client.documentId,
               data: {
                  name: data.name ?? user.client.name,
                  cpf: data.cpf ?? user.client.cpf,
                  phone: data.phone ?? user.client.phone,
                  dateOfBirth: data.dateOfBirth
                     ? new Date(data.dateOfBirth)
                     : user.client.dateOfBirth,
                  gender: (data.gender as any) ?? user.client.gender,
                  zipCode: data.zipCode ?? user.client.zipCode,
                  address: data.address ?? user.client.address,
                  number: data.number ?? user.client.number,
                  neighborhood: data.neighborhood ?? user.client.neighborhood,
                  city: data.city ?? user.client.city,
                  state: data.state ?? user.client.state,
               },
            });

            await strapi
               .documents("api::professional-data.professional-data")
               .update({
                  documentId: user.client.professional_data?.documentId,
                  data: {
                     admissionDate: data.admissionDate
                        ? new Date(data.admissionDate)
                        : user.client.professional_data?.admissionDate,
                     natureOfThePosition:
                        data.natureOfThePosition ??
                        user.client.professional_data?.natureOfThePosition,
                     sector:
                        data.sector ?? user.client.professional_data?.sector,
                     Cbo: data.Cbo ?? user.client.professional_data?.Cbo,
                     startingSalary:
                        data.startingSalary ??
                        user.client.professional_data?.startingSalary,
                     paymentMethod:
                        data.paymentMethod ??
                        user.client.professional_data?.paymentMethod,
                     initialHour: data.initialHour
                        ? timeStringToDate(data.initialHour)
                        : user.client.professional_data?.initialHour,
                     finalHour: data.finalHour
                        ? timeStringToDate(data.finalHour)
                        : user.client.professional_data?.finalHour,
                     lunchInitialHour: data.lunchInitialHour
                        ? timeStringToDate(data.lunchInitialHour)
                        : user.client.professional_data?.lunchInitialHour,
                     lunchFinalHour: data.lunchFinalHour
                        ? timeStringToDate(data.lunchFinalHour)
                        : user.client.professional_data?.lunchFinalHour,
                     days_of_work: data.daysOfWork,
                  },
               });

            //retornar informacoes atualizadas
            return await strapi
               .documents("plugin::users-permissions.user")
               .findOne({
                  documentId: user.documentId,
                  populate: {
                     client: {
                        populate: {
                           professional_data: {
                              populate: {
                                 days_of_work: true,
                              },
                           },
                        },
                     },
                  },
               });
         } catch (err) {
            //tratamento de erros
            if (err instanceof yup.ValidationError) {
               console.log("Erros do Yup custom:", err.errors);
               throw new ApplicationError(err.errors);
            }

            console.log(err);

            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Não foi possível editar o colaborador, tente novamente mais tarde",
            )
         }
      });
   }
}

export { EditUser };
