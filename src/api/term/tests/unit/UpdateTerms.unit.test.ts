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

import { UpdateTerms } from "../../services/UpdateTerms";

describe("UpdateTerms - Unit Tests", () => {
   let service: UpdateTerms;

   const mockFindFirst = jest.fn();
   const mockUpdateMany = jest.fn();
   const mockUpdate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new UpdateTerms();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            update: mockUpdate,
         })),
         query: jest.fn(() => ({
            updateMany: mockUpdateMany,
         })),
      };

      jest.clearAllMocks();
   });

   it("deve atualizar termos e política com novos valores", async () => {
      const mockTerm = {
         documentId: "term123",
         terms: "Termos antigos",
         policy: "Política antiga",
      };

      mockFindFirst.mockResolvedValue(mockTerm);
      mockUpdateMany.mockResolvedValue({ count: 10 });
      mockUpdate.mockResolvedValue({ documentId: "term123" });

      const ctx = {
         request: {
            body: {
               terms: " Novos Termos ",
               policy: " Nova Política ",
            },
         },
      };

      const result = await service.execute(ctx);

      expect(mockFindFirst).toHaveBeenCalled();
      expect(mockUpdateMany).toHaveBeenCalledWith({
         data: { isReadTerms: false },
      });
      expect(mockUpdate).toHaveBeenCalledWith({
         documentId: "term123",
         data: {
            terms: "Novos Termos",
            policy: "Nova Política",
            updatedAt: expect.any(Date),
         },
      });
      expect(result.documentId).toBe("term123");
   });

   it("deve manter valores antigos se novos estiverem vazios", async () => {
      const mockTerm = {
         documentId: "term123",
         terms: "Termos originais",
         policy: "Política original",
      };

      mockFindFirst.mockResolvedValue(mockTerm);
      mockUpdateMany.mockResolvedValue({ count: 5 });
      mockUpdate.mockResolvedValue({ documentId: "term123" });

      const ctx = {
         request: { body: { terms: "   ", policy: "" } },
      };

      await service.execute(ctx);

      expect(mockUpdate).toHaveBeenCalledWith({
         documentId: "term123",
         data: {
            terms: "Termos originais",
            policy: "Política original",
            updatedAt: expect.any(Date),
         },
      });
   });

   it("deve lançar erro se termo não for encontrado", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = {
         request: { body: { terms: "algo" } },
      };

      await expect(service.execute(ctx)).rejects.toThrow(
         "Não foi possível atualizar os termos, tente novamente mais tarde",
      );
   });

   it("deve lançar erro genérico se updateMany falhar", async () => {
      const mockTerm = { documentId: "term123", terms: "a", policy: "b" };

      mockFindFirst.mockResolvedValue(mockTerm);
      mockUpdateMany.mockRejectedValue(new Error("DB Error"));

      const ctx = {
         request: { body: { terms: "algo" } },
      };

      await expect(service.execute(ctx)).rejects.toThrow(
         "Não foi possível atualizar os termos, tente novamente mais tarde",
      );
   });

   it("deve lançar erro genérico se update do termo falhar", async () => {
      const mockTerm = { documentId: "term123", terms: "a", policy: "b" };

      mockFindFirst.mockResolvedValue(mockTerm);
      mockUpdateMany.mockResolvedValue({ count: 1 });
      mockUpdate.mockRejectedValue(
         new Error("Não foi possível atualizar os termos"),
      );

      const ctx = {
         request: { body: { terms: "algo" } },
      };

      await expect(service.execute(ctx)).rejects.toThrow(
         "Não foi possível atualizar os termos",
      );
   });
});
