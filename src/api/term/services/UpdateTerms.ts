const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class UpdateTerms {
   async execute(ctx) {
      return strapi.db.transaction(async () => {
         try {
            const {
               terms,
               policy,
            }: {
               terms: string;
               policy: string;
            } = ctx.request.body;

            const term = await strapi.documents("api::term.term").findFirst();

            await strapi.query("plugin::users-permissions.user").updateMany({
               data: {
                  isReadTerms: false,
               },
            });

            return strapi.documents("api::term.term").update({
               documentId: term.documentId,
               data: {
                  terms: terms && terms.trim() !== "" ? terms : term.terms,
                  policy: policy && policy.trim() !== "" ? policy : term.policy,
                  updatedAt: new Date(),
               },
            });
         } catch (err) {
            console.log(err);
            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Não foi possível atualizar os termos, tente novamente mais tarde",
            );
         }
      });
   }
}

export { UpdateTerms };
