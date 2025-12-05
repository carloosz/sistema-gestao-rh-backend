//imports para lancamento de erro
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class DismissUser {
   //metodo para demitir colaborador
   async dismissUser(ctx) {
      //usar transacao para garantir integridade dos dados (se der erro, os dados nao serao alterados)
      return strapi.db.transaction(async (trx) => {
         try {
            //obtendo id do colaborador pelo parametro na url da req
            const { id }: { id: string } = ctx.request.params;
            //obtendo dados relevantes no body
            const {
               date,
               observation,
               typeOfTermination,
            }: {
               date: string;
               observation: string;
               typeOfTermination: string;
            } = ctx.request.body;

            //obter usuario especifico com base no id fornecido
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
                           professional_data: true,
                        },
                     },
                  },
               });

            if (!user) {
               throw new ApplicationError("Colaborador não encontrado");
            }

            if (!user.client.isActive) {
               throw new ApplicationError("Colaborador já desligado");
            }

            //desligar colaborador
            await strapi.documents("api::client.client").update({
               documentId: user.client?.documentId,
               data: {
                  isActive: false,
                  zipCode: null,
                  address: null,
                  state: null,
                  city: null,
                  neighborhood: null,
                  number: null,
                  dateOfBirth: null,
                  gender: null
               },
            });

            await strapi
               .documents("api::professional-data.professional-data")
               .update({
                  documentId: user.client?.professional_data?.documentId,
                  data: {
                     dismissalDate: date ? new Date(date) : new Date(),
                     dismissalObservation: observation || null,
                     typeOfTermination: typeOfTermination as any,
                  },
               });

            await strapi
               .documents("plugin::users-permissions.user")
               .update({
                  documentId: user.documentId,
                  data: {
                     username: user.username + "-desligado",
                     email: `usuariodesligado${user.documentId}@email.com`,
                     blocked: true,
                  },
               });

            return {
               message: "colaborador demitido com sucesso",
            };
         } catch (err) {
            //tratamento de erros
            console.log(err);
            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Erro ao demitir colaborador, tente novamente mais tarde",
            );
         }
      });
   }
}

export { DismissUser };
