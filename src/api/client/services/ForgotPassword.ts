const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import * as crypto from 'crypto';
import { sendEmail } from '../../../infrastructure/brevoApi/sendEmail';

class ForgotPassword {
    async forgotPassword (ctx) {
        try {

            const { email } : { email: string } = ctx.request.body;

            if (!email) {
                throw new ApplicationError('E-mail deve ser informado')
            }

            const user = await strapi.documents(
                'plugin::users-permissions.user'
            ).findFirst({
                filters: {
                    email
                }
            })

            if (!user) {
                throw new ApplicationError('Usuário não encontrado')
            }

            const resetPasswordToken = crypto.randomBytes(64).toString('hex');

            await strapi.documents(
                'plugin::users-permissions.user'
            ).update({
                documentId: user.documentId,
                data: {
                    resetPasswordToken
                }
            })

            const resetPasswordLink = `https://rh/netlify.app/redefinir-senha?code=${resetPasswordToken}`

            const message = `
                <p>Solicitação de redefinição de senha</p>

                <p>Você pode usar o seguinte link para redefinir sua senha:</p>
                <p>${resetPasswordLink}</p>

                <p>Obrigado.</p>
                `;

            const emailProvider = new sendEmail()

            await emailProvider.sendEmail({
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Solicitação de redefinição de senha',
                html: message
            })

            return {
                message: 'E-mail de redefinição enviado com sucesso!'
            }
            
        } catch (err) {
            console.log(err)
            throw new ApplicationError(
                err instanceof ApplicationError 
                    ? err.message 
                    : 'Não foi possível enviar e-mail de verificação, tente novamente mais tarde',
            )
        }
    }
}

export { ForgotPassword }