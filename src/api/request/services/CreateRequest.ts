const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import createRequestSchema from "../validation/CreateRequestSchema";

import * as yup from "yup";
import * as fileType from 'file-type';

class CreateRequest {
   async createRequest(ctx) {
      return strapi.db.transaction(async (trx) => {
         try {
            const { data } = ctx.request.body;
            const { file } = ctx.request.files;

            const parsedData = JSON.parse(data);

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
                  throw new ApplicationError(
                     "Arquivo muito grande. O tamanho máximo permitido é 15 MB",
                  );
               }

               // validar tipos de arquivo
               const ALLOWED_MIME_TYPES = [
                  "application/pdf",
                  "image/jpeg",
                  "image/png",
                  "image/gif",
                  "application/msword", // .doc
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                  "application/vnd.ms-excel", // .xls
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                  "text/plain",
               ];

               const ALLOWED_EXTENSIONS = [
                  ".pdf",
                  ".jpg",
                  ".jpeg",
                  ".png",
                  ".gif",
                  ".doc",
                  ".docx",
                  ".xls",
                  ".xlsx",
                  ".txt",
               ];

               // validacao 1: verificar extensap
               const fileExtension = file.originalFilename
                  ? `.${file.originalFilename.split(".").pop().toLowerCase()}`
                  : "";

               if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
                  throw new ApplicationError(
                     `Tipo de arquivo não permitido. Extensões aceitas: ${ALLOWED_EXTENSIONS.join(", ")}`,
                  );
               }

               // validacao 2: Verificar mime type declarado
               if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                  throw new ApplicationError(
                     "Tipo de arquivo não permitido. Envie apenas documentos e imagens.",
                  );
               }

               // validação 3: verificar mime type real do arquivo (magic number)
               // isso previne que alguekm renomeie malware.exe para malware.pdf
               const fs = require("fs");
               const fileBuffer = fs.readFileSync(file.path);
               const detectedType = await fileType.fromBuffer(fileBuffer);

               if (detectedType) {
                  const detectedMimeType = detectedType.mime;

                  if (!ALLOWED_MIME_TYPES.includes(detectedMimeType)) {
                     throw new ApplicationError(
                        "O arquivo enviado não corresponde ao tipo declarado. Possível tentativa de envio de arquivo malicioso.",
                     );
                  }
               }
               // fim da validacao

               newFile = await strapi.plugins["upload"].services.upload.upload({
                  files: file,
                  data: {
                     folder: "API Uploads",
                     fileInfo: {
                        name: file.originalFilename || "default_name",
                        alternativeText: "Anexo da solicitação",
                     },
                  },
               });
            }

            return strapi.documents("api::request.request").create({
               data: {
                  type: type as any,
                  observation,
                  client: client.documentId,
                  isFinished: false,
                  file: newFile ? newFile[0].id : null,
               },
               populate: {
                  file: {
                     fields: ["name", "size", "url"],
                  },
               },
            });
         } catch (err) {
            console.log(err);

            if (err instanceof yup.ValidationError) {
               throw new ApplicationError(err.errors.join(", "));
            }

            throw new ApplicationError(
               err instanceof ApplicationError
                  ? err.message
                  : "Ocorreu um erro ao criar a solicitação",
            );
         }
      });
   }
}

export { CreateRequest };
