const mockValidate = jest.fn();

jest.mock("../../validation/RegisterUserSchema", () => ({
   __esModule: true,
   default: { validate: mockValidate },
}));

jest.mock("../../services/RegisterUser", () => {
   const actual = jest.requireActual("../../services/RegisterUser");
   return {
      ...actual,
      __esModule: true,
      default: jest.fn((str: string) => `2025-01-01T${str}:00.000Z`),
   };
});

import { RegisterUser } from "../../services/RegisterUser";
import * as yup from "yup";

describe("RegisterUser - Unit Tests", () => {
   let service: RegisterUser;

   const mockFindFirst = jest.fn();
   const mockCreate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new RegisterUser();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn((entity: string) => ({
            findFirst: mockFindFirst,
            create: mockCreate,
         })),
      };

      jest.clearAllMocks();
   });

   it("deve cadastrar usuário com sucesso", async () => {
      mockValidate.mockResolvedValue({
         email: "novo@test.com",
         password: "123456",
         name: "Novo User",
         cpf: "12345678900",
         phone: "(11) 98765-4321",
         dateOfBirth: "1990-01-01",
         gender: "Homem",
         zipCode: "12345-678",
         address: "Rua A",
         number: "100",
         neighborhood: "Centro",
         city: "São Paulo",
         state: "SP",
         admissionDate: "2025-01-01",
         Cbo: "123456",
         startingSalary: 5000,
         natureOfThePosition: "Analista",
         sector: "TI",
         paymentMethod: "Pix",
         initialHour: "08:00",
         finalHour: "17:00",
         lunchInitialHour: "12:00",
         lunchFinalHour: "13:00",
         daysOfWork: ["Segunda", "Terça"],
      });

      mockFindFirst.mockResolvedValue(null); // não existe
      mockCreate
         .mockResolvedValueOnce({ documentId: "user123" }) // user
         .mockResolvedValueOnce({ documentId: "client123" }) // client
         .mockResolvedValueOnce({ documentId: "pd123" }); // professional_data

      const ctx = {
         request: {
            body: {
               email: "novo@test.com",
               password: "123456",
               name: "Novo User",
            },
         },
      };

      const result = await service.registerUser(ctx);

      expect(mockValidate).toHaveBeenCalledWith(
         ctx.request.body,
         expect.any(Object),
      );
      expect(mockCreate).toHaveBeenCalledTimes(3);
      expect(result.documentId).toBe("client123");
   });

   it("deve lançar erro se email ou CPF já existe", async () => {
      mockValidate.mockResolvedValue({
         email: "existe@test.com",
         cpf: "12345678900",
      });
      mockFindFirst.mockResolvedValue({ email: "existe@test.com" });

      const ctx = {
         request: { body: { email: "existe@test.com" } },
      };

      await expect(service.registerUser(ctx)).rejects.toThrow(
         "Dados já cadastrados",
      );
   });

   it("deve lançar erro de validação Yup", async () => {
      mockValidate.mockRejectedValue(
         new yup.ValidationError("Email inválido", "invalid", "email"),
      );

      const ctx = {
         request: { body: { email: "invalid" } },
      };

      await expect(service.registerUser(ctx)).rejects.toThrow("Email inválido");
   });

   it("deve lançar erro genérico se create falhar", async () => {
      mockValidate.mockResolvedValue({
         email: "novo@test.com",
         password: "123456",
      });
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockRejectedValue(new Error("DB Error"));

      const ctx = {
         request: { body: { email: "novo@test.com", password: "123456" } },
      };

      await expect(service.registerUser(ctx)).rejects.toThrow(
         "Erro ao cadastrar usuário, tente novamente mais tarde",
      );
   });
});
