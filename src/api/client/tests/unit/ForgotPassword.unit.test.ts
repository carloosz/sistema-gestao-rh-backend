// MOCK DO crypto
jest.mock("crypto", () => ({
   randomBytes: jest.fn(() => ({
      toString: jest.fn(() => "mocked-token-1234567890"),
   })),
}));

// MOCK DO SendEmail (classe externa)
const mockSendEmail = jest.fn();
jest.mock("../../../../infrastructure/brevoApi/sendEmail", () => ({
   SendEmail: jest.fn(() => ({
      sendEmail: mockSendEmail,
   })),
}));

import { ForgotPassword } from "../../services/ForgotPassword";

describe("ForgotPassword - Unit Tests", () => {
   let service: ForgotPassword;

   const mockFindFirst = jest.fn();
   const mockUpdate = jest.fn();

   beforeEach(() => {
      service = new ForgotPassword();

      (global as any).strapi = {
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            update: mockUpdate,
         })),
      };

      // Mock do process.env
      process.env.EMAIL_FROM = "no-reply@empresa.com";

      jest.clearAllMocks();
   });

   it("deve enviar e-mail de redefinição com sucesso", async () => {
      mockFindFirst.mockResolvedValue({
         documentId: "user123",
         email: "user@test.com",
      });

      mockSendEmail.mockResolvedValue({ success: true });

      const ctx = {
         request: { body: { email: "user@test.com" } },
      };

      const result = await service.forgotPassword(ctx);

      expect(mockFindFirst).toHaveBeenCalledWith({
         filters: { email: "user@test.com" },
         populate: {
            client: {
               fields: 'name'
            }
         }
      });

      expect(mockUpdate).toHaveBeenCalledWith({
         documentId: "user123",
         data: { resetPasswordToken: "mocked-token-1234567890" },
      });

      expect(mockSendEmail).toHaveBeenCalledWith({
         from: "no-reply@empresa.com",
         to: "user@test.com",
         subject: "Solicitação de redefinição de senha",
         html: expect.stringContaining(
            "https://rh/netlify.app/redefinir-senha?code=mocked-token-1234567890",
         ),
      });

      expect(result).toEqual({
         message: "E-mail de redefinição enviado com sucesso!",
      });
   });

   it("deve lançar erro se email não for informado", async () => {
      const ctx = {
         request: { body: {} },
      };

      await expect(service.forgotPassword(ctx)).rejects.toThrow(
         "E-mail deve ser informado",
      );
   });

   it("deve lançar erro se usuário não for encontrado", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = {
         request: { body: { email: "naoexiste@test.com" } },
      };

      await expect(service.forgotPassword(ctx)).rejects.toThrow(
         "Usuário não encontrado",
      );
   });

   it("deve lançar erro genérico se envio de e-mail falhar", async () => {
      mockFindFirst.mockResolvedValue({ documentId: "user123" });
      mockSendEmail.mockRejectedValue(new Error("SMTP Error"));

      const ctx = {
         request: { body: { email: "user@test.com" } },
      };

      await expect(service.forgotPassword(ctx)).rejects.toThrow(
         "Não foi possível enviar e-mail de verificação, tente novamente mais tarde",
      );
   });

   it("deve lançar erro se update do token falhar", async () => {
      mockFindFirst.mockResolvedValue({ documentId: "user123" });
      mockUpdate.mockRejectedValue(new Error("DB Error"));

      const ctx = {
         request: { body: { email: "user@test.com" } },
      };

      await expect(service.forgotPassword(ctx)).rejects.toThrow(
         "Não foi possível enviar e-mail de verificação, tente novamente mais tarde",
      );
   });
});
