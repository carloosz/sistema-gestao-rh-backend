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

// MOCK DO PDFKIT COM CAPTURA DO doc
let capturedDoc: any;
jest.mock("pdfkit", () => {
   const mockDoc = {
      registerFont: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      fill: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      opacity: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      page: { margins: {} },
      pipe: jest.fn(),
      end: jest.fn(),
   };

   const PDFDocumentMock = jest.fn(() => {
      capturedDoc = mockDoc; // CAPTURA O doc CRIADO
      return capturedDoc;
   });

   return PDFDocumentMock;
});

jest.mock("fs", () => ({
   createWriteStream: jest.fn(() => ({
      on: jest.fn(),
      end: jest.fn(),
   })),
}));

import { Pdf } from "../../services/Pdf";

describe("Pdf - Unit Tests", () => {
   let service: Pdf;
   const mockFindOne = jest.fn();

   beforeEach(() => {
      service = new Pdf();
      capturedDoc = null; // Reseta a captura

      (global as any).strapi = {
         documents: jest.fn(() => ({
            findOne: mockFindOne,
         })),
      };

      jest.clearAllMocks();
   });

   it("deve gerar PDF com sucesso", async () => {
      const mockClient = {
         id: "123",
         name: "João Silva",
         cpf: "123.456.789-00",
         phone: "(11) 98765-4321",
         dateOfBirth: "1990-01-01T00:00:00.000Z",
         gender: "Homem",
         zipCode: "12345-678",
         address: "Rua A",
         number: "100",
         neighborhood: "Centro",
         city: "São Paulo",
         state: "SP",
         user: { email: "joao@test.com" },
         professional_data: {
            admissionDate: "2025-01-01T00:00:00.000Z",
            natureOfThePosition: "Analista",
            sector: "TI",
            Cbo: "123456",
            startingSalary: 5000,
            paymentMethod: "Pix",
            initialHour: "08:00:00.000Z",
            finalHour: "17:00:00.000Z",
            lunchInitialHour: "12:00:00.000Z",
            lunchFinalHour: "13:00:00.000Z",
            days_of_work: [{ name: "Segunda" }, { name: "Terça" }],
         },
      };

      mockFindOne.mockResolvedValue(mockClient);

      const ctx = { request: { params: { id: "123" } } };

      const result = await service.exportUserPdf(ctx);

      // AGORA USA O doc CAPTURADO
      expect(capturedDoc.registerFont).toHaveBeenCalledTimes(3);
      expect(capturedDoc.registerFont).toHaveBeenCalledWith(
         "Lato-Regular",
         "./public/fonts/lato/Lato-Regular.ttf",
      );
      expect(capturedDoc.registerFont).toHaveBeenCalledWith(
         "Lato-Bold",
         "./public/fonts/lato/Lato-Bold.ttf",
      );
      expect(capturedDoc.registerFont).toHaveBeenCalledWith(
         "Lato-Black",
         "./public/fonts/lato/Lato-Black.ttf",
      );

      expect(capturedDoc.text).toHaveBeenCalledWith("RH+", 50, 50);
      expect(capturedDoc.addPage).toHaveBeenCalled();
      expect(capturedDoc.end).toHaveBeenCalled();

      expect(result).toBe("/pdf/colaborador_123.pdf");
   });

   it("deve lançar erro se colaborador não encontrado", async () => {
      mockFindOne.mockResolvedValue(null);
      const ctx = { request: { params: { id: "999" } } };
      await expect(service.exportUserPdf(ctx)).rejects.toThrow(
         "Colaborador não encontrado",
      );
   });
});
