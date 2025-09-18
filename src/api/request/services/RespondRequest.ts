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
                    throw new ApplicationError('Resposta deve ser informada')
                }

                const request = await strapi.documents(
                    'api::request.request'
                ).findOne({
                    documentId: id,
                    populate: {
                        client: {
                            populate: {
                                user: true
                            }
                        }
                    }
                })

                if (!request) {
                    throw new ApplicationError('Solicitação não encontrada')
                }

                if (request.isFinished) {
                    throw new ApplicationError('Solicitação já respondida')
                }

                const sendEmail = new SendEmail();
                await sendEmail.sendEmail({
                    from: process.env.EMAIL_FROM,
                    to: request.client.user.email,
                    subject: `Solicitação ${request.id} respondida`,
                    html: `<p>${answer}</p>`
                })

                return await strapi.documents(
                    'api::request.request'
                ).update({
                    documentId: id,
                    data: {
                        answer,
                        isFinished: true,
                        answeredAt: new Date()
                    }
                })

            } catch (err) {
                console.log(err)
                throw new ApplicationError(
                    err instanceof ApplicationError
                        ? err.message
                        : 'Não foi possível responder a solicitação, tente novamente mais tarde',
                )
            }
        })
    }

}

export { RespondRequest }