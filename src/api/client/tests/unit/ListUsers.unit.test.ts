import { ListUsers } from "../../services/ListUsers";
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

const mockFindMany = jest.fn();
const mockCount = jest.fn();

const mockStrapi = {
   documents: jest.fn(() => ({
      findMany: mockFindMany,
      count: mockCount,
   })),
};

global.strapi = mockStrapi as any;

describe("ListUsers - Unit Tests", () => {
   let service: ListUsers;

   beforeEach(() => {
      service = new ListUsers();
      jest.clearAllMocks();
      jest.spyOn(console, "log").mockImplementation(() => {});
      mockCount.mockResolvedValue(0);
   });

   it("deve retornar usuários formatados com paginação padrão", async () => {
      const mockUsers = [
         {
            client: {
               id: 1,
               documentId: "abc123",
               name: "João Silva",
               registrationNumber: "12345",
               phone: "11999999999",
               professional_data: {
                  natureOfThePosition: "Dev",
                  dismissalDate: "2025-01-01T00:00:00.000Z",
               },
            },
         },
      ];

      mockFindMany.mockResolvedValue(mockUsers);
      mockCount.mockResolvedValue(1);

      const ctx = {
         request: { query: {} },
      };

      const result = await service.listUsers(ctx);

      expect(mockFindMany).toHaveBeenCalledWith({
         filters: expect.any(Object),
         offset: 0,
         limit: 9,
         populate: expect.any(Object),
      });

      expect(result).toEqual({
         users: [
            {
               id: 1,
               documentId: "abc123",
               name: "João Silva",
               natureOfThePosition: "Dev",
               registrationNumber: "12345",
               phone: "11999999999",
               dismissalDate: "2025-01-01T00:00:00.000Z",
            },
         ],
         page: 1,
         pageSize: 9,
         totalPages: 1,
         totalItems: 1,
         totalThisPage: 1,
      });
   });

   it("deve aplicar filtro de busca por nome do cliente", async () => {
      const ctx = {
         request: { query: { search: "joão" } },
      };

      await service.listUsers(ctx);

      expect(mockFindMany).toHaveBeenCalledWith(
         expect.objectContaining({
            filters: expect.objectContaining({
               $or: [
                  { client: { name: { $containsi: "joão" } } },
                  { email: { $containsi: "joão" } },
               ],
            }),
         }),
      );
   });

   it("deve tratar erro e lançar ApplicationError", async () => {
      const error = new Error("DB error");

      mockFindMany.mockRejectedValue(error);

      const ctx = { request: { query: {} } };

      await expect(service.listUsers(ctx)).rejects.toThrow(
         "Erro ao listar colaboradores, tente novamente",
      );

      expect(console.log).toHaveBeenCalledWith(error);
   });

   it("deve formatar dismissalDate como ISO string ou null", async () => {
      const usersWithNull = [
         {
            client: {
               id: 2,
               documentId: "xyz",
               name: "Maria",
               registrationNumber: "678",
               phone: "11888888888",
               professional_data: {
                  natureOfThePosition: "PM",
                  dismissalDate: null,
               },
            },
         },
      ];

      mockFindMany.mockResolvedValue(usersWithNull);
      mockCount.mockResolvedValue(1);

      const ctx = { request: { query: {} } };
      const result = await service.listUsers(ctx);

      expect(result.users[0].dismissalDate).toBeNull();
   });

   it("deve aplicar paginação customizada", async () => {
      const ctx = {
         request: { query: { page: "3", pageSize: "5" } },
      };

      await service.listUsers(ctx);

      expect(mockFindMany).toHaveBeenCalledWith(
         expect.objectContaining({
            offset: 10, // (3-1) * 5
            limit: 5,
         }),
      );
   });

   it("deve filtrar apenas clientes ativos (isActive=true)", async () => {
      const ctx = {
         request: { query: { isActive: true } },
      };

      await service.listUsers(ctx);

      expect(mockFindMany).toHaveBeenCalledWith(
         expect.objectContaining({
            filters: expect.objectContaining({
               client: { isActive: true },
            }),
         }),
      );
   });

   it("deve calcular totalPages corretamente", async () => {
      mockCount.mockResolvedValue(25);
      mockFindMany.mockResolvedValue(new Array(9).fill({ client: { id: 1 } }));

      const ctx = { request: { query: { pageSize: "9" } } };
      const result = await service.listUsers(ctx);

      expect(result.totalPages).toBe(3); // 25 / 9 = 2.77 → 3
   });

   it("deve usar valores padrão quando query estiver vazio", async () => {
      const ctx = { request: { query: {} } };

      await service.listUsers(ctx);

      expect(mockFindMany).toHaveBeenCalledWith(
         expect.objectContaining({
            offset: 0,
            limit: 9,
         }),
      );
   });

   it("deve calcular totalPages = 1 quando totalItems = 0", async () => {
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);

      const ctx = { request: { query: {} } };
      const result = await service.listUsers(ctx);

      expect(result.totalPages).toBe(1);
      expect(result.totalItems).toBe(0);
      expect(result.totalThisPage).toBe(0);
   });

   it("deve retornar detalhes do usuário corretamente", async () => {
      const mockUser = {
         client: {
            id: 1,
            documentId: "abc123",
            name: "João",
            professional_data: { admissionDate: "2020-01-01" },
         },
      };

      const mockFindFirst = jest.fn().mockResolvedValue(mockUser);
      (global as any).strapi.documents.mockReturnValue({
         findFirst: mockFindFirst,
      });

      const ctx = { request: { params: { id: "abc123" } } };
      const result = await service.listUserDetails(ctx);

      expect(result.id).toBe(1);
      expect(result.admissionDate).toBe("2020-01-01T00:00:00.000Z");
   });

   it("deve lançar ApplicationError se usuário não encontrado", async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null);
      (global as any).strapi.documents.mockReturnValue({
         findFirst: mockFindFirst,
      });

      const ctx = { request: { params: { id: "inexistente" } } };

      await expect(service.listUserDetails(ctx)).rejects.toThrow(
         ApplicationError,
      );

      await expect(service.listUserDetails(ctx)).rejects.toHaveProperty(
         "message",
         "Colaborador não encontrado",
      );
   });

   it("deve retornar informações do usuário logado", async () => {
      const mockClient = {
         name: "João Silva",
         cpf: "12345678900",
         phone: "11999999999",
         user: { email: "joao@empresa.com" },
         dateOfBirth: "1990-01-01",
         gender: "M",
         zipCode: "01001-000",
         address: "Rua Exemplo",
         state: "SP",
         city: "São Paulo",
         neighborhood: "Centro",
         number: "100",
      };

      const mockFindFirst = jest.fn().mockResolvedValue(mockClient);
      (global as any).strapi.documents.mockReturnValue({
         findFirst: mockFindFirst,
      });

      const ctx = { state: { user: { documentId: "abc123" } } };

      const result = await service.listMyInformations(ctx);

      expect(result).toEqual({
         name: "João Silva",
         cpf: "12345678900",
         phone: "11999999999",
         email: "joao@empresa.com",
         dateOfBirth: "1990-01-01",
         gender: "M",
         zipCode: "01001-000",
         address: "Rua Exemplo",
         state: "SP",
         city: "São Paulo",
         neighborhood: "Centro",
         number: "100",
      });
   });

   it("deve lançar ApplicationError se usuário logado não encontrado", async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null);
      (global as any).strapi.documents.mockReturnValue({
         findFirst: mockFindFirst,
      });

      const ctx = { state: { user: { documentId: "inexistente" } } };

      await expect(service.listMyInformations(ctx)).rejects.toThrow(
         ApplicationError,
      );
      await expect(service.listMyInformations(ctx)).rejects.toHaveProperty(
         "message",
         "Usuário não encontrado",
      );
   });
});
