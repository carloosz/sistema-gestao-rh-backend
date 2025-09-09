const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class DismissUser {

    async dismissUser (ctx) {
        return strapi.db.transaction(async (trx) => {
            try {

                const { id } : { id: string } = ctx.request.params;
                const { date, observation, typeOfTermination } : { date: string, observation: string, typeOfTermination: string } = ctx.request.body;

                const user = await strapi.documents(
                    'plugin::users-permissions.user'
                ).findFirst({
                    filters: {
                        client: {
                            documentId: id
                        }
                    },
                    populate: {
                        client: {
                            populate: {
                                professional_data: true
                            }
                        }
                    }
                })

                if (!user) {
                    throw new ApplicationError('Colaborador não encontrado')
                }

                if (!user.client.isActive) {
                    throw new ApplicationError('Colaborador já desligado')
                }

                await strapi.documents(
                    'api::client.client'
                ).update({
                    documentId: user.client?.documentId,
                    data: {
                        isActive: false
                    }
                })

                await strapi.documents(
                    'api::professional-data.professional-data'
                ).update({
                    documentId: user.client?.professional_data?.documentId,
                    data: {
                        dismissalDate: date ? new Date(date) : new Date(),
                        dismissalObservation: observation || null,
                        typeOfTermination: typeOfTermination as any
                    }
                })

                return {
                    message: "colaborador demitido com sucesso"
                }
                
            } catch (err) {
                console.log(err)
                throw new ApplicationError(
                    err instanceof ApplicationError ? err.message : 'Erro ao demitir colaborador, tente novamente mais tarde'
                )
            }
        })
    }

}

export { DismissUser }