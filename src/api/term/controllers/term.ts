/**
 * term controller
 */

import { factories } from "@strapi/strapi";
import { ListTerm } from "../services/ListTerm";
import { AcceptTerms } from "../services/AcceptTerms";
import { UpdateTerms } from "../services/UpdateTerms";

export default factories.createCoreController(
   "api::term.term",
   ({ strapi }) => ({
      async find() {
         return new ListTerm().execute();
      },
      async acceptTerms(ctx) {
         return new AcceptTerms().execute(ctx);
      },
      async create() {},
      async update(ctx) {
         return new UpdateTerms().execute(ctx);
      },
   }),
);
