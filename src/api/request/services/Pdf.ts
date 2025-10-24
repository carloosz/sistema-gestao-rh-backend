const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;
const pdfkit = require('pdfkit');
const fs = require('fs');

class Pdf {
   async exportRequestPdf(ctx) {
      try {
         const { id }: { id: string } = ctx.request.params;

         const request = await strapi
            .documents("api::request.request")
            .findOne({
               documentId: id,
               populate: {
                  client: true,
                  file: {
                     fields: ["name"],
                  },
               },
            });

         if (!request) {
            throw new ApplicationError("Solicitação não encontrada");
         }

         if (!request.isFinished) {
            throw new ApplicationError("Solicitação não respondida");
         }

         const doc = new pdfkit({ size: "A4" }); //841.89, 595.28
         doc.page.margins = { top: 0, left: 0, right: 0, bottom: 0 };

         doc.registerFont(
            "Lato-Regular",
            "./public/fonts/lato/Lato-Regular.ttf",
         )
            .registerFont("Lato-Bold", "./public/fonts/lato/Lato-Bold.ttf")
            .registerFont("Lato-Black", "./public/fonts/lato/Lato-Black.ttf");

         const fileName = `solicitacao_${request.id}.pdf`;
         const stream = fs.createWriteStream("public/pdf/" + fileName);

         doc.pipe(stream);

         const squareSize = 20;
         const squares = [
            // Linha 1 (topo)
            { x: 0, y: 0, color: '#1a1a1a' },
            { x: squareSize, y: 0, color: '#2d2d2d' },
            { x: squareSize * 2, y: 0, color: '#404040' },
            { x: squareSize * 3, y: 0, color: '#1a1a1a' },
            { x: squareSize * 4, y: 0, color: '#2d2d2d' },

            // Linha 2
            { x: 0, y: squareSize, color: '#2d2d2d' },
            { x: squareSize, y: squareSize, color: '#1a1a1a' },
            { x: squareSize * 2, y: squareSize, color: '#4d4d4d' },
            { x: squareSize * 3, y: squareSize, color: '#404040' },

            // Linha 3
            { x: 0, y: squareSize * 2, color: '#4d4d4d' },
            { x: squareSize, y: squareSize * 2, color: '#404040' },
            { x: squareSize * 2, y: squareSize * 2, color: '#1a1a1a' },

            // Linha 4
            { x: 0, y: squareSize * 3, color: '#1a1a1a' },
            { x: squareSize, y: squareSize * 3, color: '#2d2d2d' },

            // Linha 5
            { x: 0, y: squareSize * 4, color: '#404040' },
         ];

         squares.forEach(square => {
            doc.rect(square.x, square.y, squareSize, squareSize)
               .fill(square.color);
         });

         doc.font("Lato-Black")
            .fontSize(30)
            .fillColor("#2E519C")
            .text("RH+", 50, 50);

         doc.fontSize(20)
            .font("Lato-Regular")
            .fillColor("#000000")
            .text("Detalhes da solicitação", 50, 100)
            .opacity(0.4)
            .text(`#${request.id}`, 260, 100)
            .opacity(1);

         doc.fontSize(12)
            .font("Lato-Bold")
            .text("Dados da solicitação", 50, 150);

         doc.moveTo(50, 170).lineTo(550, 170).stroke();

         doc.moveTo(50, 390).lineTo(550, 390).stroke();

         doc.moveTo(50, 170).lineTo(50, 390).stroke();

         doc.moveTo(550, 170).lineTo(550, 390).stroke();

         doc.font("Lato-Bold")
            .fontSize(12)
            .text("Colaborador(a)", 60, 180)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(request.client.name, 60, 200);

         doc.opacity(1)
            .font("Lato-Bold")
            .text("Data", 300, 180)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(new Date(request.createdAt).toLocaleString(), 300, 200);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Tipo de solicitação", 60, 240)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(request.type, 60, 260);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Anexo", 300, 240)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(request.file ? request.file.name : "N/A", 300, 260);

         let observation = request.observation;

         if (observation.length > 310) {
            observation = observation.substring(0, 310) + "...";
         }

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Observações", 60, 300)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(request.observation, 60, 320, {
               width: 485,
            })
            .opacity(1);

         doc.font("Lato-Bold").text("Dados da resposta", 50, 400);

         doc.moveTo(50, 420).lineTo(550, 420).stroke();

         doc.moveTo(50, 640).lineTo(550, 640).stroke();

         doc.moveTo(50, 420).lineTo(50, 640).stroke();

         doc.moveTo(550, 420).lineTo(550, 640).stroke();

         doc.text("Data", 60, 430)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               request.answeredAt
                  ? new Date(request.answeredAt).toLocaleString()
                  : "N/A",
               60,
               450,
            );

         const answer = request.answer;

         if (answer.length > 500) {
            request.answer = request.answer.substring(0, 310) + "...";
         }

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Resposta", 60, 490)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(request.answer, 60, 510, {
               width: 485,
            })
            .opacity(1);

         const now = new Date();
         now.setHours(now.getHours() - 3);

         doc.text("Data da impressão: ", 60, 800)
            .opacity(0.7)
            .text(now.toLocaleString(), 165, 800);

         doc.end();

         return `/pdf/${fileName}`;
      } catch (err) {
         console.log(err);
         throw new ApplicationError(
            err instanceof ApplicationError
               ? err.message
               : "Erro ao exportar o PDF, tente novamente mais tarde",
         );
      }
   }
}

export { Pdf };
