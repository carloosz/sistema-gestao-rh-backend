/**
 * request controller
 */

import { factories } from "@strapi/strapi";
import { CreateRequest } from "../services/CreateRequest";
import { ListRequests } from "../services/ListRequests";
import { RespondRequest } from "../services/RespondRequest";
import { Pdf } from "../services/Pdf";

export default factories.createCoreController(
   "api::request.request",
   ({ strapi }) => ({
      create(ctx) {
         const requestService = new CreateRequest();
         return requestService.createRequest(ctx);
      },
      listMyRequests(ctx) {
         const requestService = new ListRequests();
         return requestService.listMyRequests(ctx);
      },
      find(ctx) {
         const requestService = new ListRequests();
         return requestService.listRequestsMaster(ctx);
      },
      respondRequest(ctx) {
         const respondRequest = new RespondRequest();
         return respondRequest.respondRequest(ctx);
      },
      findOne(ctx) {
         const requestService = new ListRequests();
         return requestService.listRequestDetails(ctx);
      },
      update(ctx) {},
      delete(ctx) {},
      exportRequestPdf(ctx) {
         const pdf = new Pdf();
         return pdf.exportRequestPdf(ctx);
      },
   }),
);
