const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class RespondRequest {

    async respondRequest (ctx) {
        try {

            const { id } : { id: string } = ctx.request.params;
            const { answer } : { answer: string } = ctx.request.body;

            if (!answer) {
                throw new ApplicationError('Resposta deve ser informada')
            }

            const request = await strapi.documents(
                'api::request.request'
            ).findOne({
                documentId: id
            })

            if (!request) {
                throw new ApplicationError('Solicitação não encontrada')
            }

            if (request.isFinished) {
                throw new ApplicationError('Solicitação já respondida')
            }

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
    }

}

export { RespondRequest }