const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class AcceptTerms {
   async execute(ctx) {
      return strapi.db.transaction(async (trx) => {
         try {
            const userDocumentId = ctx.state.user.documentId;

            const user = await strapi
               .documents("plugin::users-permissions.user")
               .findOne({
                  documentId: userDocumentId,
               });

            if (!user) {
               throw new ApplicationError("Usuário não encontrado");
            }

            return strapi.documents("plugin::users-permissions.user").update({
               documentId: userDocumentId,
               data: {
                  isReadTerms: true,
                  readTermsAt: new Date(),
               },
            });
         } catch (err) {
            console.log(err);
            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Não foi possível aceitar os termos, tente novamente mais tarde",
            );
         }
      });
   }
}

export { AcceptTerms };
