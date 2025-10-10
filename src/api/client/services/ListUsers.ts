const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class ListUsers {
   async listUsers(ctx) {
      try {
         const {
            page = 1,
            pageSize = 9,
            search,
            isActive = true,
         }: {
            page?: number;
            pageSize?: number;
            search?: string;
            isActive?: boolean;
         } = ctx.request.query;

         const users = await strapi
            .documents("plugin::users-permissions.user")
            .findMany({
               filters: {
                  $or: [
                     {
                        client: {
                           name: {
                              $containsi: search || "",
                           },
                        },
                     },
                     {
                        email: {
                           $containsi: search || "",
                        },
                     },
                  ],
                  client: {
                     isActive: isActive || true,
                  },
                  role: {
                     id: 1,
                  },
               },
               offset: (Number(page || 1) - 1) * Number(pageSize || 9),
               limit: Number(pageSize || 9),
               populate: {
                  client: {
                     populate: {
                        professional_data: true,
                     },
                  },
               },
            });

         const countUsers = await strapi
            .documents("plugin::users-permissions.user")
            .count({
               filters: {
                  $or: [
                     {
                        client: {
                           name: {
                              $containsi: search || "",
                           },
                        },
                     },
                     {
                        email: {
                           $containsi: search || "",
                        },
                     },
                  ],
                  client: {
                     isActive: isActive || true,
                  },
                  role: {
                     id: 1,
                  },
               },
            });

         const formattedUsers =
            users.map((user) => ({
               id: user.client?.id,
               documentId: user.client.documentId,
               name: user.client?.name,
               natureOfThePosition:
                  user.client.professional_data?.natureOfThePosition,
               registrationNumber: user.client.registrationNumber,
               phone: user.client.phone,
               dismissalDate: user.client.professional_data?.dismissalDate
                  ? new Date(
                       user.client.professional_data.dismissalDate,
                    ).toISOString()
                  : null,
            })) || [];

         return {
            users: formattedUsers,
            page: Number(page),
            pageSize: Number(pageSize),
            totalPages: Math.ceil(countUsers / Number(pageSize)),
            totalItems: countUsers,
            totalThisPage: users.length,
         };
      } catch (err) {
         console.log(err);
         throw new ApplicationError(
            err instanceof ApplicationError
               ? err.message
               : "Erro ao listar colaboradores, tente novamente",
         );
      }
   }

   async listUserDetails(ctx) {
      try {
         const { id }: { id: string } = ctx.request.params;

         const user = await strapi
            .documents("plugin::users-permissions.user")
            .findFirst({
               filters: {
                  client: {
                     documentId: id,
                  },
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

         const formattedUser = {
            id: user.client?.id,
            documentId: user.client.documentId,
            name: user.client?.name,
            isActive: user.client?.isActive,
            cpf: user.client?.cpf,
            phone: user.client.phone,
            email: user.email,
            dateOfBirth: user.client.dateOfBirth,
            gender: user.client.gender,
            registrationNumber: user.client.registrationNumber,
            zipCode: user.client.zipCode,
            address: user.client.address,
            state: user.client.state,
            city: user.client.city,
            neighborhood: user.client.neighborhood,
            number: user.client.number,
            admissionDate: user.client.professional_data?.admissionDate
               ? new Date(
                    user.client.professional_data.admissionDate,
                 ).toISOString()
               : null,
            natureOfThePosition:
               user.client.professional_data?.natureOfThePosition,
            sector: user.client.professional_data?.sector,
            Cbo: user.client.professional_data?.Cbo,
            startingSalary: user.client.professional_data?.startingSalary,
            paymentMethod: user.client.professional_data?.paymentMethod,
            daysOfwork: user.client.professional_data?.days_of_work,
            initialHour: user.client.professional_data?.initialHour,
            finalHour: user.client.professional_data?.finalHour,
            lunchInitialHour: user.client.professional_data?.lunchInitialHour,
            lunchFinalHour: user.client.professional_data?.lunchFinalHour,
            dismissalDate: user.client.professional_data?.dismissalDate
               ? new Date(
                    user.client.professional_data.dismissalDate,
                 ).toISOString()
               : null,
            dismissalObservation:
               user.client.professional_data?.dismissalObservation,
            typeOfTermination: user.client.professional_data?.typeOfTermination,
         };

         return formattedUser;
      } catch (err) {
         console.log(err);
         throw new ApplicationError(
            err instanceof ApplicationError
               ? err.message
               : "Erro ao listar detalhes do colaborador, tente novamente",
         );
      }
   }
}

export { ListUsers };
