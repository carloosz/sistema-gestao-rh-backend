import { DismissUser } from "../../services/DismissUser";

describe("DismissUser - Unit Tests", () => {
   let service: DismissUser;

   const mockFindFirst = jest.fn();
   const mockUpdate = jest.fn();
   const mockTransaction = jest.fn().mockImplementation((cb) => cb({}));

   beforeEach(() => {
      service = new DismissUser();

      (global as any).strapi = {
         db: { transaction: mockTransaction },
         documents: jest.fn(() => ({
            findFirst: mockFindFirst,
            update: mockUpdate,
         })),
      };

      jest.clearAllMocks();
   });

   it("deve demitir colaborador com sucesso", async () => {
      mockFindFirst.mockResolvedValue({
         documentId: "user123",
         email: "user123@email.com",
         username: "user123",
         client: {
            documentId: "client123",
            isActive: true,
            professional_data: { documentId: "pd123" },
         },
      });

      const ctx = {
         request: {
            params: { id: "client123" },
            body: {
               date: "2025-06-01",
               observation: "Demissão por justa causa",
               typeOfTermination: "Justa Causa",
            },
         },
      };

      const result = await service.dismissUser(ctx);

      expect(mockFindFirst).toHaveBeenCalledWith(
         expect.objectContaining({
            filters: { client: { documentId: "client123" } },
         }),
      );

      expect(mockUpdate).toHaveBeenNthCalledWith(1, {
         documentId: "client123",
         data: {
            isActive: false,
            zipCode: null,
            address: null,
            state: null,
            city: null,
            neighborhood: null,
            number: null,
            dateOfBirth: null,
            gender: null,
         },
      });

      expect(mockUpdate).toHaveBeenNthCalledWith(2, {
         documentId: "pd123",
         data: {
            dismissalDate: new Date("2025-06-01"),
            dismissalObservation: "Demissão por justa causa",
            typeOfTermination: "Justa Causa",
         },
      });

      expect(mockUpdate).toHaveBeenNthCalledWith(3, {
         documentId: "user123",
         data: {
            blocked: true,
            email: "usuariodesligadouser123@email.com",
            username: "user123-desligado",
         },
      });

      expect(result).toEqual({ message: "colaborador demitido com sucesso" });
   });

   it("deve lançar erro se colaborador não encontrado", async () => {
      mockFindFirst.mockResolvedValue(null);

      const ctx = {
         request: { params: { id: "ghost123" }, body: {} },
      };

      await expect(service.dismissUser(ctx)).rejects.toThrow(
         "Colaborador não encontrado",
      );
   });

   it("deve lançar erro se colaborador já estiver desligado", async () => {
      mockFindFirst.mockResolvedValue({
         documentId: "user123",
         client: {
            documentId: "client123",
            isActive: false,
         },
      });

      const ctx = {
         request: { params: { id: "client123" }, body: {} },
      };

      await expect(service.dismissUser(ctx)).rejects.toThrow(
         "Colaborador já desligado",
      );
   });

   it("deve lançar erro genérico se update falhar", async () => {
      mockFindFirst.mockResolvedValue({
         documentId: "user123",
         client: {
            documentId: "client123",
            isActive: true,
            professional_data: { documentId: "pd123" },
         },
      });

      mockUpdate.mockRejectedValueOnce(new Error("DB Error"));

      const ctx = {
         request: { params: { id: "client123" }, body: {} },
      };

      await expect(service.dismissUser(ctx)).rejects.toThrow(
         "Erro ao demitir colaborador",
      );
   });

   it("deve usar data atual se não for informada", async () => {
      const now = new Date();
      jest.spyOn(global, "Date").mockImplementation((() => now) as any);

      mockFindFirst.mockResolvedValue({
         documentId: "user123",
         email: "user123@email.com",
         username: "user123",
         client: {
            documentId: "client123",
            isActive: true,
            professional_data: { documentId: "pd123" },
         },
      });

      const ctx = {
         request: { params: { id: "client123" }, body: {} },
      };

      await service.dismissUser(ctx);

      expect(mockUpdate).toHaveBeenNthCalledWith(
         2,
         expect.objectContaining({
            data: expect.objectContaining({
               dismissalDate: now,
               dismissalObservation: null,
            }),
         }),
      );
   });
});
