const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class ListUsers {
    async listUsers (ctx) {
        try {

            const {
                page = 1,
                pageSize = 9,
                search,
                isActive = true
            } : {
                page?: number,
                pageSize?: number,
                search?: string,
                isActive?: boolean
            } = ctx.request.query;

            const users = await strapi.documents(
                'plugin::users-permissions.user'
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
                            email: {
                                $containsi: search || ''
                            }
                        }
                    ],
                    client: {
                        isActive : isActive || true
                    },
                    role: {
                        id: 1
                    }
                },
                offset: (Number(page || 1) - 1) * Number(pageSize || 9),
                limit: Number(pageSize || 9),
                populate: {
                    client: {
                        populate: {
                            professional_data: true
                        }
                    }
                }
            })

            const countUsers = await strapi.documents(
                'plugin::users-permissions.user'
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
                            email: {
                                $containsi: search || ''
                            }
                        }
                    ],
                    client: {
                        isActive : isActive || true
                    },
                    role: {
                        id: 1
                    }
                }
            })

            const formattedUsers = users.map(user => ({
                documentId: user.client.documentId,
                name: user.client?.name,
                natureOfThePosition: user.client.professional_data?.natureOfThePosition,
                registrationNumber: user.client.registrationNumber,
                phone: user.client.phone,
                dismissalDate: user.client.professional_data?.dismissalDate ? new Date(user.client.professional_data.dismissalDate).toISOString() : null,
            })) || []

            return {
                users: formattedUsers,
                page: Number(page),
                pageSize: Number(pageSize),
                totalPages: Math.ceil(users.length / Number(pageSize)),
                totalItems: countUsers,
                totalThisPage: users.length
            }

        } catch (err) {
            console.log(err)
            throw new ApplicationError (
                err instanceof ApplicationError ? err.message : 'Erro ao listar colaboradores, tente novamente'
            )
        }
    }
}

export { ListUsers }