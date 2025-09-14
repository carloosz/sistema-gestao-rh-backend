const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class ListRequests {

    async listMyRequests (ctx) {
        try {

            const userDocumentId = ctx.state.user.documentId
            const { page = 1, pageSize = 9 } : { page: number, pageSize: number } = ctx.request.query
            
            const client = await strapi.documents(
                'api::client.client'
            ).findFirst({
                filters: {
                    user: {
                        documentId: userDocumentId
                    }
                }
            })

            if (!client) {
                throw new ApplicationError('Colaborador não encontrado')
            }

            const clientRequests = await strapi.documents(
                'api::request.request'
            ).findMany({
                filters: {
                    client: {
                        documentId: client.documentId
                    }
                },
                offset: ( Number(page || 1) - 1) * Number(pageSize || 9),
                limit: Number(pageSize) || 9,
            })

            const requestsCount = await strapi.documents(
                'api::request.request'
            ).count({
                filters: {
                    client: {
                        documentId: client.documentId
                    }
                }
            })

            console.log(clientRequests)

            const formattedRequests = clientRequests.map(request => ({
                id: request.id,
                documentId: request.documentId,
                observation: request.observation,
                type: request.type,
                isFinished: request.isFinished,
                createdAt: request.createdAt,
            })) || []

            return {
                requests: formattedRequests,
                page: Number(page || 1),
                pageSize: Number(pageSize || 9),
                totalPages: Math.ceil(requestsCount / Number(pageSize || 9)),
                totalItems: requestsCount,
                totalThisPage: formattedRequests.length
            }

        } catch (err) {
            console.log(err)
            throw new ApplicationError(
                err instanceof ApplicationError 
                    ? err.message 
                    : 'Não foi possível listar as solicitações, tente novamente mais tarde',
            )
        }
    }

    async listRequestDetails (ctx) {
        try {

            const { id } : { id: string } = ctx.request.params;

            const request = await strapi.documents(
                'api::request.request'
            ).findFirst({
                filters: {
                    documentId: id
                },
                populate: {
                    client: {
                        fields: ['name']
                    }
                }
            })

            if (!request) {
                throw new ApplicationError('Solicitação não encontrada')
            }

            return request

        } catch (err) {
            console.log(err)
            throw new ApplicationError(
                err instanceof ApplicationError 
                    ? err.message 
                    : 'Não foi possível listar detalhes da solicitação, tente novamente mais tarde',
            )
        }
    }

    async listRequestsMaster (ctx) {
        try {

            const { search, page = 1, pageSize = 9 } : { search: string, page: number, pageSize: number } = ctx.request.query

            const requests = await strapi.documents(
                'api::request.request'
            ).findMany({
                filters: {
                    $or: [
                        {
                            client: {
                                name: {
                                    $containsi: search || ''
                                },
                            }
                        },
                        {
                           client: {
                               user: {
                                   email: {
                                       $containsi: search || ''
                                   }
                               },
                           }
                        }
                    ]
                },
                populate: {
                    client: {
                        fields: ['name']
                    }
                },
                offset: ( Number(page || 1) - 1) * Number(pageSize || 9),
                limit: Number(pageSize) || 9,
            })

            const requestsCount = await strapi.documents(
                'api::request.request'
            ).count({
                filters: {
                    $or: [
                        {
                            client: {
                                name: {
                                    $containsi: search || ''
                                },
                            }
                        },
                        {
                           client: {
                               user: {
                                   email: {
                                       $containsi: search || ''
                                   }
                               },
                           }
                        }
                    ]
                }
            })

            const formattedRequests = requests.map(request => ({
                id: request.id,
                documentId: request.documentId,
                name: request.client.name,
                type: request.type,
                isFinished: request.isFinished,
                createdAt: request.createdAt,
            }))

            return {
                requests: formattedRequests,
                page: Number(page || 1),
                pageSize: Number(pageSize || 9),
                totalPages: Math.ceil(requestsCount / Number(pageSize || 9)),
                totalItems: requestsCount,
                totalThisPage: requests.length
            }

        } catch (err) {
            console.log(err)
            throw new ApplicationError(
                err instanceof ApplicationError 
                    ? err.message 
                    : 'Não foi possível listar as solicitações, tente novamente mais tarde',
            )
        }
    }

}

export { ListRequests }