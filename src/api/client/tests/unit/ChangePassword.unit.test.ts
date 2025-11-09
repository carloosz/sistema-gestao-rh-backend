import { ChangePassword } from "../../services/ChangePassword";
import bcrypt from "bcrypt";

describe("ChangePassword - Unit Tests", () => {
   let service: ChangePassword;

   const mockFindFirst = jest.fn();
   const mockUpdate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new ChangePassword();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn().mockReturnValue({
            findFirst: mockFindFirst,
            update: mockUpdate,
         }),
      };

      jest.clearAllMocks();
   });

   it("deve alterar senha com sucesso", async () => {
      const hashedPassword = await bcrypt.hash("123456", 10);
      const user = { documentId: "abc123", password: hashedPassword };

      mockFindFirst.mockResolvedValue(user);
      mockUpdate.mockResolvedValue({ documentId: "abc123" });

      const ctx = {
         state: { user: { documentId: "abc123" } },
         request: {
            body: {
               currentPassword: "123456",
               password: "nova789",
               passwordConfirmation: "nova789",
            },
         },
      };

      const result = await service.changePassword(ctx);

      expect(mockFindFirst).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith(
         expect.objectContaining({
            documentId: "abc123",
            data: { password: "nova789" },
         }),
      );
      expect(result.documentId).toBe("abc123");
   });

   it("deve lançar erro se usuário não encontrado", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = {
         state: { user: { documentId: "inexistente" } },
         request: {
            body: {
               currentPassword: "123",
               password: "456",
               passwordConfirmation: "456",
            },
         },
      };

      await expect(service.changePassword(ctx)).rejects.toThrow(
         "Usuário não encontrado",
      );
   });
});
