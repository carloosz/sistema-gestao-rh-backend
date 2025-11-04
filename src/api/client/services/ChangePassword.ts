//imports para lancamento de erros
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;
//bcrypt para comparacao de senhas
import bcrypt from "bcrypt";

class ChangePassword {
   //metodo para alterar senha
   async changePassword(ctx) {
      //usar transacao para garantir integridade dos dados (se der erro, os dados nao serao alterados)
      return strapi.db.transaction(async (trx) => {
         try {
            //obtendo dados de senhas no corpo da requisicao
            const {
               currentPassword,
               password,
               passwordConfirmation,
            }: {
               currentPassword: string;
               password: string;
               passwordConfirmation: string;
            } = ctx.request.body;

            //obtendo id do usuario logado
            const userDocumentId = ctx.state.user.documentId;

            //pegar informacoes do usuario logado
            const user = await strapi
               .documents("plugin::users-permissions.user")
               .findFirst({
                  filters: {
                     documentId: userDocumentId,
                  },
               });

            //algumas verifcacoes
            if (!user) {
               throw new ApplicationError("Usuário não encontrado");
            }

            if (!currentPassword || !password || !passwordConfirmation) {
               throw new ApplicationError(
                  "Todos os campos devem ser informados",
               );
            }

            if (password !== passwordConfirmation) {
               throw new ApplicationError("Senhas não conferem");
            }

            //verificar se a senha atual esta correta
            const isPasswordValid = await bcrypt.compare(
               currentPassword,
               user.password,
            );

            //se a senha atual nao estiver correta, lancar erro
            if (!isPasswordValid) {
               throw new ApplicationError("Senha inválida");
            }

            //alterar senha, retornando o objeto alterado
            return await strapi
               .documents("plugin::users-permissions.user")
               .update({
                  documentId: user.documentId,
                  data: {
                     password,
                  },
               });
         } catch (err) {
            //tratamento de erros
            console.log(err);
            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Não foi possível alterar a senha, tente novamente mais tarde",
            );
         }
      });
   }
}

export { ChangePassword };
