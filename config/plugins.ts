module.exports = ({ env }) => ({
   "users-permissions": {
      config: {
         jwt: {
            /* the following  parameter will be used to generate:
             - regular tokens with username and password
             - refreshed tokens when using the refreshToken API
            */
            expiresIn: "1d", // This value should be lower than the refreshTokenExpiresIn below.
         },
      },
   },
   "refresh-token": {
      config: {
         refreshTokenExpiresIn: "30d", // this value should be higher than the jwt.expiresIn
         requestRefreshOnAll: true, // automatically send a refresh token in all login requests.
         refreshTokenSecret: env("REFRESH_JWT_SECRET") || "SomethingSecret",
         cookieResponse: false, // if set to true, the refresh token will be sent in a cookie
      },
   },
   // email: {
   //     config: {
   //         provider: 'strapi-provider-email-brevo',
   //             providerOptions: {
   //             host: env('SMTP_USERNAME'),
   //             apiKey: process.env.BREVO_API_KEY,
   //         },
   //         settings: {
   //             defaultFrom: 'suporte@goodcare.com.br',
   //             defaultReplyTo: 'suporte@goodcare.com.br',
   //         },
   //     },
   // },
});
