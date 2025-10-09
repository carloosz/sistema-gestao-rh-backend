const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import { CreateRequestDTO } from "../dto/CreateRequestDTO";
import  createRequestSchema from "../validation/CreateRequestSchema";

import * as yup from 'yup';

class CreateRequest {

    async createRequest (ctx) {
        return strapi.db.transaction(async (trx) => {
            try {

                const {
                    type,
                    observation
                } = await createRequestSchema.validate(
                    ctx.request.body,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                )

                const userDocumentId = ctx.state.user.documentId

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

                return await strapi.documents(
                    'api::request.request'
                ).create({
                    data: {
                        type: type as any, 
                        observation,
                        client: client.documentId,
                        isFinished: false
                    }
                 })

            } catch (err) {
                console.log(err);

                if (err instanceof yup.ValidationError) {
                    throw new ApplicationError(err.errors.join(', '))
                }

                throw new ApplicationError(
                    err instanceof ApplicationError
                        ? err.message
                        : 'Ocorreu um erro ao criar a solicitação'
                )
            }
        })
    }

}

export { CreateRequest }