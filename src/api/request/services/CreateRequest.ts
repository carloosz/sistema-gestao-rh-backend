const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import { CreateRequestDTO } from "../dto/CreateRequestDTO";
import createRequestSchema from "../validation/CreateRequestSchema";

import * as yup from "yup";

class CreateRequest {
   async createRequest(ctx) {
      return strapi.db.transaction(async (trx) => {
         try {
            const { data } = ctx.request.body
            const { file } = ctx.request.files

            const parsedData = JSON.parse(data)

            const { type, observation } = await createRequestSchema.validate(
               parsedData,
               {
                  abortEarly: false,
                  stripUnknown: true,
               },
            );

            const userDocumentId = ctx.state.user.documentId;

            const client = await strapi
               .documents("api::client.client")
               .findFirst({
                  filters: {
                     user: {
                        documentId: userDocumentId,
                     },
                  },
               });

            if (!client) {
               throw new ApplicationError("Colaborador não encontrado");
            }

            let newFile;

            if (file) {
               const MAX_FILE_SIZE = 15 * 1024 * 1024; //15 mb

               if (file.size > MAX_FILE_SIZE) {
                  throw new ApplicationError("Arquivo muito grande. O tamanho máximo permitido é 15 MB");
               }

               newFile = await strapi.plugins[
                  "upload"
               ].services.upload.upload({
                  files: file,
                  data: {
                     folder: "API Uploads",
                     fileInfo: {
                        name: file.originalFilename || "default_name",
                        alternativeText: "Anexo da solicitação",
                     },
                  },
               });
            }

            return strapi
               .documents("api::request.request")
               .create({
                  data: {
                     type: type as any,
                     observation,
                     client: client.documentId,
                     isFinished: false,
                     file: newFile ? newFile[0].id : null,
                  },
                  populate: {
                     file: {
                        fields: ['name', 'size', 'url']
                     }
                  }
               });

         } catch (err) {
            console.log(err);

            if (err instanceof yup.ValidationError) {
               throw new ApplicationError(err.errors.join(", "));
            }

            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Ocorreu um erro ao criar a solicitação",
            );
         }
      });
   }
}

export { CreateRequest };
