const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class Pdf {
    async exportUserPdf(ctx) {
        try {
            const { id } : { id: string } = ctx.request.params;

            return `/pdf/user_details_${id}.pdf`

        } catch (err) {
            console.log(err);
            throw new ApplicationError(
                err instanceof ApplicationError 
                    ? err.message 
                    : 'Erro ao exportar o PDF, tente novamente mais tarde',
            )
        }
    }
}

export { Pdf };