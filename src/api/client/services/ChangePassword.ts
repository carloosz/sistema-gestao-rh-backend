const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import bcrypt from "bcrypt";

class ChangePassword {
  async changePassword(ctx) {
    return strapi.db.transaction(async (trx) => {
      try {
        const {
          currentPassword,
          password,
          passwordConfirmation,
        }: {
          currentPassword: string;
          password: string;
          passwordConfirmation: string;
        } = ctx.request.body;

        const userDocumentId = ctx.state.user.documentId;

        const user = await strapi
          .documents("plugin::users-permissions.user")
          .findFirst({
            filters: {
              documentId: userDocumentId,
            },
          });

        if (!user) {
          throw new ApplicationError("Usuário não encontrado");
        }

        if (!currentPassword || !password || !passwordConfirmation) {
          throw new ApplicationError("Todos os campos devem ser informados");
        }

        if (password !== passwordConfirmation) {
          throw new ApplicationError("Senhas não conferem");
        }

        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );

        if (!isPasswordValid) {
          throw new ApplicationError("Senha inválida");
        }

        return await strapi.documents("plugin::users-permissions.user").update({
          documentId: user.documentId,
          data: {
            password,
          },
        });
      } catch (err) {
        console.log(err);
        throw new ApplicationError(
          err instanceof ApplicationError
            ? err.message
            : "Não foi possível alterar a senha, tente novamente mais tarde"
        );
      }
    });
  }
}

export { ChangePassword };
