/**
 * term router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::term.term");

module.exports = {
   routes: [
      {
         method: "GET",
         path: "/terms",
         handler: "term.find",
      },
      {
         method: "POST",
         path: "/terms",
         handler: "term.create",
      },
      {
         method: "PUT",
         path: "/terms",
         handler: "term.update",
      },
      {
         method: "POST",
         path: "/acceptTerms",
         handler: "term.acceptTerms",
      },
   ],
};
