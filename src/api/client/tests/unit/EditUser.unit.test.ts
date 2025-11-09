const mockValidate = jest.fn();

jest.mock("../../validation/EditUserSchema", () => ({
   __esModule: true,
   default: { validate: mockValidate },
}));

jest.mock("../../services/RegisterUser", () => ({
   __esModule: true,
   default: jest.fn((str: string) => `2025-01-01T${str}:00.000Z`),
}));

import { EditUser } from "../../services/EditUser";
import * as yup from "yup";

describe("EditUser - Unit Tests", () => {
   let service: EditUser;

   const mockFindFirst = jest.fn();
   const mockUpdate = jest.fn();
   const mockFindOne = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new EditUser();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            update: mockUpdate,
            findOne: mockFindOne,
         })),
      };

      jest.clearAllMocks();
   });

   it("deve editar usuário com sucesso", async () => {
      mockValidate.mockResolvedValue({ email: "new@test.com" });

      mockFindFirst.mockResolvedValueOnce(null); // existingUser
      mockFindFirst.mockResolvedValueOnce({
         documentId: "user123",
         email: "old@test.com",
         client: {
            documentId: "c123",
            professional_data: { documentId: "pd123" },
         },
      });
      mockFindOne.mockResolvedValue({ email: "new@test.com" });

      const ctx = {
         state: { user: { documentId: "user123", role: { id: 1 } } },
         request: { params: {}, body: { email: "new@test.com" } },
      };

      const result = await service.editUser(ctx);

      expect(mockValidate).toHaveBeenCalledWith(
         ctx.request.body,
         expect.objectContaining({ abortEarly: false, stripUnknown: true }),
      );
      expect(mockUpdate).toHaveBeenCalled();
      expect(result.email).toBe("new@test.com");
   });

   it("deve lançar erro de validação", async () => {
      mockValidate.mockRejectedValue(
         new yup.ValidationError("Email inválido", "email", "email"),
      );

      const ctx = {
         state: { user: { documentId: "user123", role: { id: 1 } } },
         request: { params: {}, body: { email: "invalid" } },
      };

      await expect(service.editUser(ctx)).rejects.toThrow("Email inválido");
   });
});
