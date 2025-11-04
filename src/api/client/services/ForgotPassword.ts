const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import * as crypto from "crypto";
import { SendEmail } from "../../../infrastructure/brevoApi/sendEmail";

class ForgotPassword {
   //metodo de esqueci a senha
   async forgotPassword(ctx) {
      try {
         //obter email do corpo da requisicao
         const { email }: { email: string } = ctx.request.body;

         if (!email) {
            throw new ApplicationError("E-mail deve ser informado");
         }

         //achar usuario correspondente com base no email
         const user = await strapi
            .documents("plugin::users-permissions.user")
            .findFirst({
               filters: {
                  email,
               },
            });

         if (!user) {
            throw new ApplicationError("Usuário não encontrado");
         }

         //gerar token de redefinicao
         const resetPasswordToken = crypto.randomBytes(64).toString("hex");

         //setar token de redefinicao no usuario
         await strapi.documents("plugin::users-permissions.user").update({
            documentId: user.documentId,
            data: {
               resetPasswordToken,
            },
         });

         //montar o link de redefinicao, com a url da pagina e o param code, passando o token recem criado
         const resetPasswordLink = `https://rh/netlify.app/redefinir-senha?code=${resetPasswordToken}`;

         //mensagem basica para o e-mail
         const message = `
                <p>Solicitação de redefinição de senha</p>

                <p>Você pode usar o seguinte link para redefinir sua senha:</p>
                <p>${resetPasswordLink}</p>

                <p>Obrigado.</p>
                `;

         //instanciando a classe de envio de e-mail
         const emailProvider = new SendEmail();

         //enviando o e-mail
         await emailProvider.sendEmail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Solicitação de redefinição de senha",
            html: message,
         });

         return {
            message: "E-mail de redefinição enviado com sucesso!",
         };
      } catch (err) {
         //tratamento de erros padrao
         console.log(err);
         throw new ApplicationError(
            err instanceof ApplicationError
               ? err.message
               : "Não foi possível enviar e-mail de verificação, tente novamente mais tarde",
         );
      }
   }
}

export { ForgotPassword };
