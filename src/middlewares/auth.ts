//import do jwt, para gerar o token
const jwt = require("jsonwebtoken");
//declarando o id do plugin do refresh
const PLUGIN_ID = "refresh-token";

//funcao para calcular a validade do token
function calculateMaxAge(param) {
   const unit = param.slice(-1);
   const value = parseInt(param.slice(0, -1));
   let maxAge;
   switch (unit) {
      case "d":
         maxAge = 1e3 * 60 * 60 * 24 * value;
         break;
      case "h":
         maxAge = 1e3 * 60 * 60 * value;
         break;
      case "m":
         maxAge = 1e3 * 60 * value;
         break;
      default:
         throw new Error(
            'Invalid tokenExpires format. Use formats like "30d", "1h", "15m".',
         );
   }
   return maxAge;
}

module.exports = () => {
   return async (ctx, next) => {
      await next();

      //interceptar as requisicoes de login
      const config2 = strapi.config.get(`plugin::${PLUGIN_ID}`) as any;
      if (
         ctx.request.method === "POST" &&
         ctx.request.path === "/api/auth/local"
      ) {
         const requestRefresh =
            ctx.request.body?.requestRefresh || config2.requestRefreshOnAll;
         //verificar se a resposta da req foi bem sucedida
         if (
            ctx.response.body &&
            ctx.response.message === "OK" &&
            requestRefresh
         ) {
            //emitir o refresh token
            const refreshEntry = await strapi
               .plugin(PLUGIN_ID)
               .service("service")
               .create(ctx.response.body?.user, ctx);
            const refreshToken = jwt.sign(
               {
                  userId: ctx.response.body?.user?.id,
                  secret: refreshEntry.documentId,
               },
               config2.refreshTokenSecret,
               { expiresIn: config2.refreshTokenExpiresIn },
            );
            const user = await strapi
               .query("plugin::users-permissions.user")
               .findOne({
                  where: { id: ctx.response.body?.user?.id },
                  populate: ["role"],
               });

            if (config2.cookieResponse) {
               ctx.cookies.set("refreshToken", refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production" ? true : false,
                  maxAge: calculateMaxAge(config2.refreshTokenExpiresIn),
                  domain:
                     process.env.NODE_ENV === "development"
                        ? "localhost"
                        : process.env.PRODUCTION_URL,
               });
            } else {
               ctx.response.body = {
                  ...ctx.response.body,
                  refreshToken,
                  role: user.role,
               };
            }
         }
      } else if (
         ctx.request.method === "POST" &&
         ctx.request.path === "/api/auth/local/refresh"
      ) {
         const refreshToken = ctx.request.body?.refreshToken;

         if (refreshToken) {
            try {
               const decoded = await jwt.verify(
                  refreshToken,
                  config2.refreshTokenSecret,
               );
               if (decoded) {
                  const data = await strapi
                     .query("plugin::refresh-token.token")
                     .findOne({
                        where: { documentId: decoded.secret },
                     });
                  if (data) {
                     const user = await strapi
                        .query("plugin::users-permissions.user")
                        .findOne({
                           where: { id: decoded.userId },
                           populate: ["role"],
                        });
                     ctx.status = 200;
                     ctx.response.body = {
                        jwt: strapi
                           .plugin("users-permissions")
                           .service("jwt")
                           .issue({ id: decoded.userId }),
                        role: user.role.name,
                     };
                  } else {
                     ctx.status = 401;
                     ctx.response.body = { error: "Invalid Token" };
                  }
               }
            } catch (err) {
               ctx.status = 401;
               ctx.response.body = { error: "Invalid Token" };
            }
         }
      }
   };
};
