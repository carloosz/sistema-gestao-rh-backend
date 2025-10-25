const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;
const pdfkit = require('pdfkit');
const fs = require('fs');

class Pdf {
   async exportUserPdf(ctx) {
      try {
         const { id }: { id: string } = ctx.request.params;

         const client = await strapi
            .documents("api::client.client")
            .findOne({
               documentId: id,
               populate: {
                  user: true,
                  professional_data: {
                     populate: {
                        days_of_work: true,
                     },
                  }
               },
            });

         if (!client) {
            throw new ApplicationError("Colaborador não encontrado");
         }

         const doc = new pdfkit({ size: "A4" }); //841.89, 595.28
         doc.page.margins = { top: 0, left: 0, right: 0, bottom: 0 };

         doc.registerFont(
            "Lato-Regular",
            "./public/fonts/lato/Lato-Regular.ttf",
         )
            .registerFont("Lato-Bold", "./public/fonts/lato/Lato-Bold.ttf")
            .registerFont("Lato-Black", "./public/fonts/lato/Lato-Black.ttf");

         const fileName = `colaborador_${client.id}.pdf`;
         const stream = fs.createWriteStream("public/pdf/" + fileName);

         doc.pipe(stream);

         const squareSize = 20;
         const squares = [
            // Linha 1 (topo)
            { x: 0, y: 0, color: "#1a1a1a" },
            { x: squareSize, y: 0, color: "#2d2d2d" },
            { x: squareSize * 2, y: 0, color: "#404040" },
            { x: squareSize * 3, y: 0, color: "#1a1a1a" },
            { x: squareSize * 4, y: 0, color: "#2d2d2d" },

            // Linha 2
            { x: 0, y: squareSize, color: "#2d2d2d" },
            { x: squareSize, y: squareSize, color: "#1a1a1a" },
            { x: squareSize * 2, y: squareSize, color: "#4d4d4d" },
            { x: squareSize * 3, y: squareSize, color: "#404040" },

            // Linha 3
            { x: 0, y: squareSize * 2, color: "#4d4d4d" },
            { x: squareSize, y: squareSize * 2, color: "#404040" },
            { x: squareSize * 2, y: squareSize * 2, color: "#1a1a1a" },

            // Linha 4
            { x: 0, y: squareSize * 3, color: "#1a1a1a" },
            { x: squareSize, y: squareSize * 3, color: "#2d2d2d" },

            // Linha 5
            { x: 0, y: squareSize * 4, color: "#404040" },
         ];

         squares.forEach((square) => {
            doc.rect(square.x, square.y, squareSize, squareSize).fill(
               square.color,
            );
         });

         doc.font("Lato-Black")
            .fontSize(30)
            .fillColor("#2E519C")
            .text("RH+", 50, 50);

         doc.fontSize(20)
            .font("Lato-Regular")
            .fillColor("#000000")
            .text("Detalhes do colaborador", 50, 100)
            .opacity(0.4)
            .text(`#${client.id}`, 270, 100)
            .opacity(1);

         doc.fontSize(12)
            .font("Lato-Bold")
            .text("Dados pessoais", 50, 150);

         doc.moveTo(50, 170).lineTo(550, 170).stroke();

         doc.moveTo(50, 390).lineTo(550, 390).stroke();

         doc.moveTo(50, 170).lineTo(50, 390).stroke();

         doc.moveTo(550, 170).lineTo(550, 390).stroke();

         doc.font("Lato-Bold")
            .fontSize(12)
            .text("Nome", 60, 180)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.name, 60, 200);

         doc.opacity(1)
            .font("Lato-Bold")
            .text("CPF", 300, 180)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.cpf,300,200,);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Telefone", 60, 240)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.phone, 60, 260);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("E-mail", 300, 240)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.user?.email, 300, 260);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Data de nascimento", 60, 300)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               client.dateOfBirth
                  ? new Date(client.dateOfBirth).toLocaleDateString("pt-BR")
                  : "N/A",
               60,
               320,
            )
            .opacity(1);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Sexo", 300, 300)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.gender, 300, 320);

         doc.font("Lato-Bold").text("Endereço", 50, 400);

         doc.moveTo(50, 420).lineTo(550, 420).stroke();

         doc.moveTo(50, 640).lineTo(550, 640).stroke();

         doc.moveTo(50, 420).lineTo(50, 640).stroke();

         doc.moveTo(550, 420).lineTo(550, 640).stroke();

         doc.opacity(1)
            .font("Lato-Bold")
            .fontSize(12)
            .text("CEP", 60, 430)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.zipCode, 60, 450);

         doc.opacity(1)
            .font("Lato-Bold")
            .text("Logradouro", 300, 430)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.address,300,450,);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Estado", 60, 490)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.state, 60, 510);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Cidade", 300, 490)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.city, 300, 510);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Bairro", 60, 550)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.neighborhood, 60, 570);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Número", 300, 550)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.number, 300, 570)
            .opacity(1);

         const now = new Date();
         now.setHours(now.getHours() - 3);

         doc.text("Data da impressão: ", 60, 800)
            .opacity(0.7)
            .text(now.toLocaleString("pt-BR"), 165, 800)
            .opacity(1)
            .text('Página', 460, 800)
            .opacity(0.7)
            .text('1 de 2', 500, 800);

         doc.addPage();
         doc.page.margins = { top: 0, left: 0, right: 0, bottom: 0 };

         squares.forEach((square) => {
            doc.rect(square.x, square.y, squareSize, squareSize).fill(
               square.color,
            );
         });

         doc.font("Lato-Black")
            .fontSize(30)
            .fillColor("#2E519C")
            .text("RH+", 50, 50)

         doc.fontSize(20)
         .font("Lato-Regular")
         .fillColor("#000000")
         .text("Detalhes do colaborador", 50, 100)
         .opacity(0.4)
         .text(`#${client.id}`, 270, 100)
         .opacity(1);

         doc.fontSize(12)
            .font("Lato-Bold")
            .text("Dados profissionais", 50, 150);

         doc.moveTo(50, 170).lineTo(550, 170).stroke();

         doc.moveTo(50, 390).lineTo(550, 390).stroke();

         doc.moveTo(50, 170).lineTo(50, 390).stroke();

         doc.moveTo(550, 170).lineTo(550, 390).stroke();

         doc.font("Lato-Bold")
            .fontSize(12)
            .text("Data da admissão", 60, 180)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               client.professional_data.admissionDate
                  ? new Date(
                       client.professional_data.admissionDate,
                    ).toLocaleDateString("pt-BR")
                  : "Não informado",
               60,
               200,
            );

         doc.opacity(1)
            .font("Lato-Bold")
            .text("Natureza do cargo", 300, 180)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.professional_data.natureOfThePosition,300,200,);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Setor", 60, 240)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.professional_data.sector, 60, 260);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("CBO", 300, 240)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(client.professional_data.Cbo, 300, 260);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Salário inicial", 60, 300)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               client.professional_data.startingSalary
                  ? Number(
                       client.professional_data.startingSalary,
                    ).toLocaleString("pt-BR", {
                       style: "currency",
                       currency: "BRL",
                    })
                  : "Não informado",
               60,
               320,
            )
            .opacity(1);

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Forma de pagamento", 300, 300)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               client.professional_data.paymentMethod
                  ? client.professional_data.paymentMethod
                  : "Não informado",
               300,
               320,
            );

         doc.font("Lato-Bold").text("Horário de trabalho", 50, 400);

         doc.moveTo(50, 420).lineTo(550, 420).stroke();

         doc.moveTo(50, 640).lineTo(550, 640).stroke();

         doc.moveTo(50, 420).lineTo(50, 640).stroke();

         doc.moveTo(550, 420).lineTo(550, 640).stroke();

          doc.opacity(1)
             .font("Lato-Bold")
             .fontSize(12)
             .text("Dias de trabalho", 60, 430)
             .font("Lato-Regular")
             .opacity(0.7)
             .text(
                client.professional_data.days_of_work
                   ? client.professional_data.days_of_work
                        .map((day) => day.name)
                        .join(", ")
                   : "Não informado",
                60,
                450,
             );

         doc.opacity(1)
            .font("Lato-Bold")
            .text("Horario de trabalho", 300, 430)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               client.professional_data.initialHour &&
                  client.professional_data.finalHour
                  ? `${String(client.professional_data.initialHour).substring(0, 5)} às ${String(client.professional_data.finalHour).substring(0, 5)}`
                  : "Não informado",
               300,
               450,
            );

         doc.font("Lato-Bold")
            .opacity(1)
            .text("Horário de refeição", 60, 490)
            .font("Lato-Regular")
            .opacity(0.7)
            .text(
               client.professional_data.lunchInitialHour &&
                  client.professional_data.lunchFinalHour
                  ? `${String(client.professional_data.lunchInitialHour).substring(0, 5)} às ${String(client.professional_data.lunchFinalHour).substring(0, 5)}`
                  : "Não informado",
               60,
               510,
            );

         doc.opacity(1)
            .font("Lato-Regular")
            .text("Data da impressão: ", 60, 800)
            .opacity(0.7)
            .text(now.toLocaleString("pt-BR"), 165, 800)
            .opacity(1)
            .text('Página', 460, 800)
            .opacity(0.7)
            .text('2 de 2', 500, 800);

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
