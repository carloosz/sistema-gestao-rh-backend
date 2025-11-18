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
               populate: {
                  client: {
                     fields: 'name'
                  }
               }
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
         const resetPasswordLink = `https://sistema-gestao-rh-colaborador.netlify.app/redefinir-senha?code=${resetPasswordToken}`;

         //mensagem basica para o e-mail
         const message = `
            <!DOCTYPE html>
            <html>
               <head>
                  <meta charset="UTF-8">
               </head>
               <body style="margin: 0; padding: 20px; font-family: Lato, sans-serif; background-color: #f4f4f4;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                     <!-- Header -->
                     <div style="background-color: #2E519C; padding: 40px; text-align: center;">
                           <h1 style="color: #ffffff; margin: 0; font-size: 32px;">RH+</h1>
                           <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Sistema de Gestão de Recursos Humanos</p>
                     </div>

                     <!-- Content -->
                     <div style="padding: 40px;">
                           <h2 style="color: #333333; margin: 0 0 20px 0;">Redefinição de Senha</h2>

                           <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                              Olá, ${user.client?.name}! 👋<br><br>
                              Recebemos uma solicitação para redefinir a senha da sua conta no <strong>RH+</strong>.
                           </p>

                           <p style="color: #666666; line-height: 1.6; margin-bottom: 30px;">
                              Clique no botão abaixo para criar uma nova senha:
                           </p>

                           <!-- Button -->
                           <div style="text-align: center; margin: 30px 0;">
                              <a href="${resetPasswordLink}"
                                 style="display: inline-block; padding: 16px 40px; background-color: #2E519C; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                 Redefinir Senha
                              </a>
                           </div>

                           <p style="color: #2E519C; font-size: 14px; margin-top: 30px;">
                              Ou copie e cole este link no seu navegador:
                           </p>

                           <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #4A90E2; word-break: break-all; margin: 10px 0 30px 0;">
                              <code style="color: #666666; font-size: 14px;">${resetPasswordLink}</code>
                           </div>

                           <!-- Warning -->
                           <div style="background-color: #FFF3CD; padding: 20px; border-radius: 8px; margin-top: 30px;">
                              <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
                                 <strong>⚠️ Importante:</strong><br>
                                 Este link expira em <strong>24 horas</strong>.<br>
                                 Se você não solicitou esta redefinição, ignore este e-mail.
                              </p>
                           </div>
                     </div>

                     <!-- Footer -->
                     <div style="background-color: #f8f8f8; padding: 30px; text-align: center;">
                           <p style="color: #999999; margin: 0; font-size: 14px;">
                              Atenciosamente,<br>
                              <strong>Equipe RH+</strong>
                           </p>
                           <p style="color: #cccccc; margin-top: 20px; font-size: 12px;">
                              © 2025 RH+ - Sistema de Gestão de Recursos Humanos
                           </p>
                     </div>

                  </div>
               </body>
            </html>
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
