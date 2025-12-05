jest.mock("@strapi/utils", () => ({
   errors: {
      ApplicationError: class ApplicationError extends Error {
         constructor(message: string) {
            super(message);
            this.name = "ApplicationError";
         }
      },
   },
}));

jest.mock("yup", () => {
   const mockValidate = jest.fn();

   class ValidationError extends Error {
      errors: string[];
      constructor(errors: string[]) {
         super(errors.join(", "));
         this.errors = errors;
      }
   }

   return {
      validate: mockValidate,
      ValidationError,
   };
});

jest.mock("../../validation/CreateRequestSchema", () => ({
   validate: jest.fn(),
}));

jest.mock("file-type", () => ({
   fromBuffer: jest.fn(),
}));

jest.mock("fs", () => ({
   readFileSync: jest.fn(),
}));

import { CreateRequest } from "../../services/CreateRequest";
import createRequestSchema from "../../validation/CreateRequestSchema";
import * as fileType from "file-type";
import * as fs from "fs";

describe("CreateRequest - Unit Tests", () => {
   let service: CreateRequest;

   const mockFindFirst = jest.fn();
   const mockCreate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));
   const mockUpload = jest.fn();

   beforeEach(() => {
      service = new CreateRequest();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            create: mockCreate,
         })),
         plugins: {
            upload: {
               services: {
                  upload: { upload: mockUpload },
               },
            },
         },
      };

      jest.clearAllMocks();
   });

   it("deve criar solicitação com arquivo", async () => {
      const mockClient = { documentId: "client123" };
      const mockFile = {
         size: 1024,
         originalFilename: "comprovante.pdf",
         type: "application/pdf",
         path: "/tmp/upload.pdf",
      };
      const mockUploadedFile = [
         {
            id: "file123",
            name: "comprovante.pdf",
            size: 1024,
            url: "/uploads/abc.pdf",
         },
      ];

      mockFindFirst.mockResolvedValue(mockClient);
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });
      (fs.readFileSync as jest.Mock).mockReturnValue(
         Buffer.from("pdf content"),
      );
      (fileType.fromBuffer as jest.Mock).mockResolvedValue({
         mime: "application/pdf",
      });
      mockUpload.mockResolvedValue(mockUploadedFile);
      mockCreate.mockResolvedValue({ file: mockUploadedFile[0] });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: { file: mockFile },
         },
         state: { user: { documentId: "user123" } },
      };

      const result = await service.createRequest(ctx);

      expect(mockFindFirst).toHaveBeenCalledWith({
         filters: { user: { documentId: "user123" } },
      });
      expect(createRequestSchema.validate).toHaveBeenCalledWith(
         { type: "Atestado", observation: "Doença" },
         { abortEarly: false, stripUnknown: true },
      );
      expect(fs.readFileSync).toHaveBeenCalledWith("/tmp/upload.pdf");
      expect(fileType.fromBuffer).toHaveBeenCalled();
      expect(mockUpload).toHaveBeenCalledWith({
         files: mockFile,
         data: {
            folder: "API Uploads",
            fileInfo: {
               name: "comprovante.pdf",
               alternativeText: "Anexo da solicitação",
            },
         },
      });
      expect(mockCreate).toHaveBeenCalledWith({
         data: {
            type: "Atestado",
            observation: "Doença",
            client: "client123",
            isFinished: false,
            file: "file123",
         },
         populate: { file: { fields: ["name", "size", "url"] } },
      });
      expect(result.file.url).toBe("/uploads/abc.pdf");
   });

   it("deve criar solicitação sem arquivo", async () => {
      const mockClient = { documentId: "client123" };

      mockFindFirst.mockResolvedValue(mockClient);
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Férias",
         observation: "Planejamento",
      });
      mockCreate.mockResolvedValue({ file: null });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Férias",
                  observation: "Planejamento",
               }),
            },
            files: {},
         },
         state: { user: { documentId: "user123" } },
      };

      await service.createRequest(ctx);

      expect(mockCreate).toHaveBeenCalledWith({
         data: expect.objectContaining({
            file: null,
         }),
         populate: expect.any(Object),
      });
   });

   it("deve lançar erro de validação do Yup", async () => {
      (createRequestSchema.validate as jest.Mock).mockRejectedValue(
         new (require("yup").ValidationError)(["Tipo é obrigatório"]),
      );

      const ctx = {
         request: {
            body: { data: "{}" },
            files: {},
         },
         state: { user: { documentId: "user123" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "Tipo é obrigatório",
      );
   });

   it("deve lançar erro se cliente não for encontrado", async () => {
      mockFindFirst.mockResolvedValue(null);
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: {},
         },
         state: { user: { documentId: "user999" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "Colaborador não encontrado",
      );
   });

   it("deve lançar erro se arquivo for maior que 15MB", async () => {
      const mockFile = {
         size: 16 * 1024 * 1024,
         originalFilename: "big.pdf",
         type: "application/pdf",
      };

      mockFindFirst.mockResolvedValue({ documentId: "client123" });
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: { file: mockFile },
         },
         state: { user: { documentId: "user123" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "Arquivo muito grande",
      );
   });

   it("deve lançar erro se extensão do arquivo não for permitida", async () => {
      const mockFile = {
         size: 1024,
         originalFilename: "malware.exe",
         type: "application/x-msdownload",
      };

      mockFindFirst.mockResolvedValue({ documentId: "client123" });
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: { file: mockFile },
         },
         state: { user: { documentId: "user123" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "Tipo de arquivo não permitido. Extensões aceitas:",
      );
   });

   it("deve lançar erro se MIME type declarado não for permitido", async () => {
      const mockFile = {
         size: 1024,
         originalFilename: "script.pdf",
         type: "application/javascript",
      };

      mockFindFirst.mockResolvedValue({ documentId: "client123" });
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: { file: mockFile },
         },
         state: { user: { documentId: "user123" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "Tipo de arquivo não permitido. Envie apenas documentos e imagens.",
      );
   });

   it("deve lançar erro se MIME type real não corresponder ao declarado", async () => {
      const mockFile = {
         size: 1024,
         originalFilename: "fake.pdf",
         type: "application/pdf",
         path: "/tmp/fake.pdf",
      };

      mockFindFirst.mockResolvedValue({ documentId: "client123" });
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });
      (fs.readFileSync as jest.Mock).mockReturnValue(
         Buffer.from("exe content"),
      );
      (fileType.fromBuffer as jest.Mock).mockResolvedValue({
         mime: "application/x-msdownload", // Retorna que é um executável
      });

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: { file: mockFile },
         },
         state: { user: { documentId: "user123" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "O arquivo enviado não corresponde ao tipo declarado",
      );
   });

   it("deve lançar erro genérico se upload falhar", async () => {
      const mockFile = {
         size: 1024,
         originalFilename: "file.pdf",
         type: "application/pdf",
         path: "/tmp/file.pdf",
      };

      mockFindFirst.mockResolvedValue({ documentId: "client123" });
      (createRequestSchema.validate as jest.Mock).mockResolvedValue({
         type: "Atestado",
         observation: "Doença",
      });
      (fs.readFileSync as jest.Mock).mockReturnValue(
         Buffer.from("pdf content"),
      );
      (fileType.fromBuffer as jest.Mock).mockResolvedValue({
         mime: "application/pdf",
      });
      mockUpload.mockRejectedValue(new Error("Upload failed"));

      const ctx = {
         request: {
            body: {
               data: JSON.stringify({
                  type: "Atestado",
                  observation: "Doença",
               }),
            },
            files: { file: mockFile },
         },
         state: { user: { documentId: "user123" } },
      };

      await expect(service.createRequest(ctx)).rejects.toThrow(
         "Ocorreu um erro ao criar a solicitação",
      );
   });
});
