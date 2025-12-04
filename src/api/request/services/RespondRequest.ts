const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import { SendEmail } from "../../../infrastructure/brevoApi/sendEmail";

class RespondRequest {
   async respondRequest(ctx) {
      return await strapi.db.transaction(async (transaction) => {
         try {
            const { id }: { id: string } = ctx.request.params;
            const { answer }: { answer: string } = ctx.request.body;

            if (!answer) {
               throw new ApplicationError("Resposta deve ser informada");
            }

            const request = await strapi
               .documents("api::request.request")
               .findOne({
                  documentId: id,
                  populate: {
                     client: {
                        populate: {
                           user: true,
                        },
                     },
                  },
               });

            if (!request) {
               throw new ApplicationError("Solicitação não encontrada");
            }

            if (request.isFinished) {
               throw new ApplicationError("Solicitação já respondida");
            }

            const sendEmail = new SendEmail();
            await sendEmail.sendEmail({
               from: `'RH+' <${process.env.EMAIL_FROM}>`,
               to: request.client.user.email,
               subject: `Solicitação ${request.id} respondida`,
               html: `
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
                                 <h2 style="color: #333333; margin: 0 0 20px 0;">Solicitação Respondida</h2>

                                 <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                                    Olá, ${request.client?.name}! 👋<br><br>
                                    Sua solicitação <strong>#${request.id}</strong> foi respondida pela equipe do <strong>RH+</strong>.
                                 </p>

                                 <!-- Question Section -->
                                 <div style="margin: 30px 0;">
                                    <h3 style="color: #2E519C; font-size: 16px; margin: 0 0 10px 0;">📝 Sua Pergunta:</h3>
                                    <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #2E519C; border-radius: 4px;">
                                       <p style="color: #666666; margin: 0; line-height: 1.6;">${request.observation}</p>
                                    </div>
                                 </div>

                                 <!-- Answer Section -->
                                 <div style="margin: 30px 0;">
                                    <h3 style="color: #28a745; font-size: 16px; margin: 0 0 10px 0;">✅ Resposta:</h3>
                                    <div style="background-color: #f0f9f4; padding: 20px; border-left: 4px solid #28a745; border-radius: 4px;">
                                       <p style="color: #333333; margin: 0; line-height: 1.6;">${answer}</p>
                                    </div>
                                 </div>

                                 <!-- Info Box -->
                                 <div style="background-color: #E8F4FD; padding: 20px; border-radius: 8px; margin-top: 30px;">
                                    <p style="color: #2E519C; margin: 0; font-size: 14px; line-height: 1.6;">
                                       <strong>💡 Precisa de mais informações?</strong><br>
                                       Se você tiver dúvidas adicionais, não hesite em abrir uma nova solicitação através do sistema RH+.
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
               `,
            });

            return await strapi.documents("api::request.request").update({
               documentId: id,
               data: {
                  answer,
                  isFinished: true,
                  answeredAt: new Date(),
               },
            });
         } catch (err) {
            console.log(err);
            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Não foi possível responder a solicitação, tente novamente mais tarde",
            );
         }
      });
   }
}

export { RespondRequest };
