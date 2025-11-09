import { ResetPassword } from "../../services/ResetPassword";

describe("ResetPassword - Unit Tests", () => {
   let service: ResetPassword;

   const mockFindFirst = jest.fn();
   const mockUpdate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new ResetPassword();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            update: mockUpdate,
         })),
      };

      jest.clearAllMocks();
   });

   it("deve alterar senha com sucesso", async () => {
      mockFindFirst.mockResolvedValue({
         documentId: "user123",
         email: "user@test.com",
      });

      const ctx = {
         request: {
            body: {
               password: "nova123456",
               passwordConfirmation: "nova123456",
               code: "valid-token-123",
            },
         },
      };

      const result = await service.resetPassword(ctx);

      expect(mockFindFirst).toHaveBeenCalledWith({
         filters: { resetPasswordToken: "valid-token-123" },
      });

      expect(mockUpdate).toHaveBeenCalledWith({
         documentId: "user123",
         data: {
            password: "nova123456",
            resetPasswordToken: null,
            updatedAt: expect.any(Date),
         },
      });

      expect(result).toEqual({ message: "Senha alterada com sucesso" });
   });

   it("deve lançar erro se senha não for informada", async () => {
      const ctx = {
         request: { body: { passwordConfirmation: "123", code: "abc" } },
      };

      await expect(service.resetPassword(ctx)).rejects.toThrow(
         "Senha deve ser informada",
      );
   });

   it("deve lançar erro se confirmação de senha não for informada", async () => {
      const ctx = {
         request: { body: { password: "123456", code: "abc" } },
      };

      await expect(service.resetPassword(ctx)).rejects.toThrow(
         "Confirmação de senha deve ser informada",
      );
   });

   it("deve lançar erro se senhas não conferem", async () => {
      const ctx = {
         request: {
            body: {
               password: "senha123",
               passwordConfirmation: "senha456",
               code: "abc",
            },
         },
      };

      await expect(service.resetPassword(ctx)).rejects.toThrow(
         "Senhas não conferem",
      );
   });

   it("deve lançar erro se usuário não for encontrado pelo token", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = {
         request: {
            body: {
               password: "nova123",
               passwordConfirmation: "nova123",
               code: "token-invalido",
            },
         },
      };

      await expect(service.resetPassword(ctx)).rejects.toThrow(
         "Usuário não encontrado",
      );
   });

   it("deve lançar erro genérico se update falhar", async () => {
      mockFindFirst.mockResolvedValue({ documentId: "user123" });
      mockUpdate.mockRejectedValue(new Error("DB Error"));

      const ctx = {
         request: {
            body: {
               password: "nova123",
               passwordConfirmation: "nova123",
               code: "valid-token",
            },
         },
      };

      await expect(service.resetPassword(ctx)).rejects.toThrow(
         "Não foi possível alterar a senha, tente novamente mais tarde",
      );
   });
});
