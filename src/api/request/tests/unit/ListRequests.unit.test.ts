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

import { ListRequests } from "../../services/ListRequests";

describe("ListRequests - Unit Tests", () => {
   let service: ListRequests;

   const mockFindFirst = jest.fn();
   const mockFindMany = jest.fn();
   const mockCount = jest.fn();

   beforeEach(() => {
      service = new ListRequests();

      (global as any).strapi = {
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            findMany: mockFindMany,
            count: mockCount,
         })),
      };

      jest.clearAllMocks();
   });

   it("listMyRequests: deve listar solicitações do usuário com paginação", async () => {
      const mockClient = { documentId: "client123" };
      const mockRequests = [
         {
            id: 1,
            documentId: "req1",
            observation: "Férias",
            type: "Férias",
            isFinished: false,
            createdAt: "2025-01-01",
         },
      ];

      mockFindFirst.mockResolvedValue(mockClient);
      mockFindMany.mockResolvedValue(mockRequests);
      mockCount.mockResolvedValue(1);

      const ctx = {
         state: { user: { documentId: "user123" } },
         request: { query: { page: "1", pageSize: "9", sort: "asc" } },
      };

      const result = await service.listMyRequests(ctx);

      expect(mockFindFirst).toHaveBeenCalledWith({
         filters: { user: { documentId: "user123" } },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
         filters: { client: { documentId: "client123" } },
         sort: "isFinished:asc",
         offset: 0,
         limit: 9,
      });
      expect(mockCount).toHaveBeenCalledWith({
         filters: { client: { documentId: "client123" } },
      });

      expect(result).toEqual({
         requests: [
            {
               id: 1,
               documentId: "req1",
               observation: "Férias",
               type: "Férias",
               isFinished: false,
               createdAt: "2025-01-01",
            },
         ],
         page: 1,
         pageSize: 9,
         totalPages: 1,
         totalItems: 1,
         totalThisPage: 1,
      });
   });

   it("listMyRequests: deve lançar erro se cliente não encontrado", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = {
         state: { user: { documentId: "user999" } },
         request: { query: {} },
      };

      await expect(service.listMyRequests(ctx)).rejects.toThrow(
         "Colaborador não encontrado",
      );
   });

   it("listRequestDetails: deve retornar detalhes da solicitação", async () => {
      const mockRequest = {
         id: 1,
         documentId: "req1",
         type: "Atestado",
         client: { name: "João" },
         file: { url: "/file.pdf", name: "atestado.pdf", size: 1024 },
      };

      mockFindFirst.mockResolvedValue(mockRequest);

      const ctx = { request: { params: { id: "req1" } } };

      const result = await service.listRequestDetails(ctx);

      expect(mockFindFirst).toHaveBeenCalledWith({
         filters: { documentId: "req1" },
         populate: {
            client: { fields: ["name"] },
            file: { fields: ["url", "name", "size"] },
         },
      });
      expect(result).toBe(mockRequest);
   });

   it("listRequestDetails: deve lançar erro se solicitação não encontrada", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = { request: { params: { id: "invalid" } } };

      await expect(service.listRequestDetails(ctx)).rejects.toThrow(
         "Solicitação não encontrada",
      );
   });

   it("listRequestsMaster: deve listar todas com busca", async () => {
      const mockRequests = [
         {
            id: 1,
            documentId: "req1",
            type: "Férias",
            isFinished: true,
            createdAt: "2025-01-01",
            client: { name: "Maria" },
         },
      ];

      mockFindMany.mockResolvedValue(mockRequests);
      mockCount.mockResolvedValue(1);

      const ctx = {
         request: {
            query: { search: "maria", page: "1", pageSize: "9", sort: "desc" },
         },
      };

      const result = await service.listRequestsMaster(ctx);

      expect(mockFindMany).toHaveBeenCalledWith({
         filters: {
            $or: [
               { client: { name: { $containsi: "maria" } } },
               { client: { user: { email: { $containsi: "maria" } } } },
            ],
         },
         sort: "isFinished:desc",
         populate: { client: { fields: ["name"] } },
         offset: 0,
         limit: 9,
      });

      expect(result).toEqual({
         requests: [
            {
               id: 1,
               documentId: "req1",
               name: "Maria",
               type: "Férias",
               isFinished: true,
               createdAt: "2025-01-01",
            },
         ],
         page: 1,
         pageSize: 9,
         totalPages: 1,
         totalItems: 1,
         totalThisPage: 1,
      });
   });

   it("listRequestsMaster: deve usar createdAt:desc se sort não informado", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      const ctx = { request: { query: { page: "1" } } };

      await service.listRequestsMaster(ctx);

      expect(mockFindMany).toHaveBeenCalledWith(
         expect.objectContaining({
            sort: "createdAt:desc",
         }),
      );
   });

   it("deve propagar erro genérico em listMyRequests", async () => {
      mockFindFirst.mockRejectedValue(new Error("DB Error"));

      const ctx = {
         state: { user: { documentId: "user123" } },
         request: { query: {} },
      };

      await expect(service.listMyRequests(ctx)).rejects.toThrow(
         "Não foi possível listar as solicitações, tente novamente mais tarde",
      );
   });
});
