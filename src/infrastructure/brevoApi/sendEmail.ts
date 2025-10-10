const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

import axios from "axios";

class SendEmail {
   async sendEmail(options: {
      from: string;
      to: string;
      cc?: string;
      bcc?: string;
      replyTo?: string;
      subject: string;
      text?: string;
      html?: string;
   }) {
      try {
         const { from, to, cc, bcc, replyTo, subject, text, html, ...rest } =
            options;
         const apiKey = process.env.BREVO_API_KEY;

         let senderEmail = from;
         senderEmail = senderEmail.match(/<(.*?)>/g)
            ? senderEmail
                 .match(/<(.*?)>/g)
                 ?.map((a) => a.replace(/<|>/g, ""))[0]
            : senderEmail;

         let senderName = from;
         senderName = senderName.match(/(.*?)</g)
            ? senderName.match(/(.*?)</g)?.map((a) => a.replace(/<|>/g, ""))[0]
            : senderName;

         const msg = {
            sender: {
               name: senderName,
               email: senderEmail,
            },
            to: [{ email: to }],
            cc,
            bcc,
            // replyTo: { email: replyTo },
            subject,
            textContent: text,
            htmlContent: html,
            ...rest,
         };

         let send = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            msg,
            {
               headers: { "api-key": apiKey },
            },
         );

         // console.log(send);
         return true;
      } catch (err) {
         console.log(err);
         throw new ApplicationError(
            err instanceof ApplicationError
               ? err.message
               : "Erro ao enviar e-mail pela api brevo, tente novamente mais tarde",
         );
      }
   }
}

export { SendEmail };
