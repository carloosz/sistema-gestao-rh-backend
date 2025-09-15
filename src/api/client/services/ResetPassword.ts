const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

class ResetPassword {

    async resetPassword (ctx) {
        return strapi.db.transaction(async (trx) => {
            try {

                const {
                    password,
                    passwordConfirmation,
                    code
                } : {
                    password: string,
                    passwordConfirmation: string,
                    code: string
                } = ctx.request.body;

                if (!password) {
                    throw new ApplicationError('Senha deve ser informada')
                }

                if (!passwordConfirmation) {
                    throw new ApplicationError('Confirmação de senha deve ser informada')
                }

                if (password !== passwordConfirmation) {
                    throw new ApplicationError('Senhas não conferem')
                }

                const user = await strapi.documents(
                    'plugin::users-permissions.user'
                ).findFirst({
                    filters: {
                        resetPasswordToken: code
                    }
                })

                if (!user) {
                    throw new ApplicationError('Usuário não encontrado')
                }

                await strapi.documents(
                    'plugin::users-permissions.user'
                ).update({
                    documentId: user.documentId,
                    data: {
                        password,
                        resetPasswordToken: null,
                        updatedAt: new Date()
                    }
                })

                return {
                    message: 'Senha alterada com sucesso'
                }

            } catch (err) {
                console.log(err)
                throw new ApplicationError(
                    err instanceof ApplicationError 
                        ? err.message 
                        : 'Não foi possível alterar a senha, tente novamente mais tarde',
                )
            }
        })
    }

}

export { ResetPassword }