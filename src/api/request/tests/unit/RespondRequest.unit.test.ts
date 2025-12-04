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

const mockSendEmail = jest.fn();
jest.mock("../../../../infrastructure/brevoApi/sendEmail", () => ({
   SendEmail: jest.fn().mockImplementation(() => ({
      sendEmail: mockSendEmail,
   })),
}));

import { RespondRequest } from "../../services/RespondRequest";

describe("RespondRequest - Unit Tests", () => {
   let service: RespondRequest;

   const mockFindOne = jest.fn();
   const mockUpdate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new RespondRequest();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn(() => ({
            findOne: mockFindOne,
            update: mockUpdate,
         })),
      };

      process.env.EMAIL_FROM = "no-reply@sgrh.com";

      jest.clearAllMocks();
   });

   afterEach(() => {
      delete process.env.EMAIL_FROM;
   });

   it("deve responder solicitação com sucesso", async () => {
      const mockRequest = {
         id: 123,
         documentId: "req123",
         isFinished: false,
         client: {
            user: { email: "user@test.com" },
         },
      };

      mockFindOne.mockResolvedValue(mockRequest);
      mockUpdate.mockResolvedValue({
         documentId: "req123",
         answer: "Aprovado",
         isFinished: true,
      });

      const ctx = {
         request: {
            params: { id: "req123" },
            body: { answer: "Aprovado" },
         },
      };

      const result = await service.respondRequest(ctx);

      expect(mockFindOne).toHaveBeenCalledWith({
         documentId: "req123",
         populate: {
            client: { populate: { user: true } },
         },
      });

      expect(mockSendEmail).toHaveBeenCalledWith({
         from: "'RH+' <no-reply@empresa.com>",
         to: "user@test.com",
         subject: "Solicitação 123 respondida",
         html: expect.any(String),
      });

      expect(mockUpdate).toHaveBeenCalledWith({
         documentId: "req123",
         data: {
            answer: "Aprovado",
            isFinished: true,
            answeredAt: expect.any(Date),
         },
      });

      expect(result.documentId).toBe("req123");
   });

   it("deve lançar erro se resposta não for informada", async () => {
      const ctx = {
         request: {
            params: { id: "req123" },
            body: {},
         },
      };

      await expect(service.respondRequest(ctx)).rejects.toThrow(
         "Resposta deve ser informada",
      );
   });

   it("deve lançar erro se solicitação não for encontrada", async () => {
      mockFindOne.mockResolvedValue(null);

      const ctx = {
         request: {
            params: { id: "invalid" },
            body: { answer: "Teste" },
         },
      };

      await expect(service.respondRequest(ctx)).rejects.toThrow(
         "Solicitação não encontrada",
      );
   });

   it("deve lançar erro se solicitação já estiver respondida", async () => {
      const mockRequest = {
         id: 123,
         isFinished: true,
         client: { user: { email: "user@test.com" } },
      };

      mockFindOne.mockResolvedValue(mockRequest);

      const ctx = {
         request: {
            params: { id: "req123" },
            body: { answer: "Aprovado" },
         },
      };

      await expect(service.respondRequest(ctx)).rejects.toThrow(
         "Solicitação já respondida",
      );
   });

   it("deve lançar erro genérico se envio de email falhar", async () => {
      const mockRequest = {
         id: 123,
         documentId: "req123",
         isFinished: false,
         client: { user: { email: "user@test.com" } },
      };

      mockFindOne.mockResolvedValue(mockRequest);
      mockSendEmail.mockRejectedValue(new Error("Email failed"));

      const ctx = {
         request: {
            params: { id: "req123" },
            body: { answer: "Aprovado" },
         },
      };

      await expect(service.respondRequest(ctx)).rejects.toThrow(
         "Não foi possível responder a solicitação, tente novamente mais tarde",
      );
   });

   it("deve lançar erro genérico se update falhar", async () => {
      const mockRequest = {
         id: 123,
         documentId: "req123",
         isFinished: false,
         client: { user: { email: "user@test.com" } },
      };

      mockFindOne.mockResolvedValue(mockRequest);
      mockSendEmail.mockResolvedValue({});
      mockUpdate.mockRejectedValue(new Error("DB Error"));

      const ctx = {
         request: {
            params: { id: "req123" },
            body: { answer: "Aprovado" },
         },
      };

      await expect(service.respondRequest(ctx)).rejects.toThrow(
         "Não foi possível responder a solicitação, tente novamente mais tarde",
      );
   });
});
