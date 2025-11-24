/**
 * client controller
 */

import { factories } from "@strapi/strapi";
import { RegisterUser } from "../services/RegisterUser";
import { ListUsers } from "../services/ListUsers";
import { DismissUser } from "../services/DismissUser";
import { EditUser } from "../services/EditUser";
import { ForgotPassword } from "../services/ForgotPassword";
import { ResetPassword } from "../services/ResetPassword";
import { ChangePassword } from "../services/ChangePassword";
import { Pdf } from "../services/Pdf";

export default factories.createCoreController(
   "api::client.client",
   ({ strapi }) => ({
      create(ctx) {
         const clientService = new RegisterUser();
         return clientService.registerUser(ctx);
      },
      find(ctx) {
         const clientService = new ListUsers();
         return clientService.listUsers(ctx);
      },
      findOne(ctx) {
         const clientService = new ListUsers();
         return clientService.listUserDetails(ctx);
      },
      dismissUser(ctx) {
         const clientService = new DismissUser();
         return clientService.dismissUser(ctx);
      },
      update(ctx) {
         const clientService = new EditUser();
         return clientService.editUser(ctx);
      },
      forgotPassword(ctx) {
         const clientService = new ForgotPassword();
         return clientService.forgotPassword(ctx);
      },
      resetPassword(ctx) {
         const clientService = new ResetPassword();
         return clientService.resetPassword(ctx);
      },
      changePassword(ctx) {
         const clientService = new ChangePassword();
         return clientService.changePassword(ctx);
      },
      exportUserPdf(ctx) {
         const clientService = new Pdf();
         return clientService.exportUserPdf(ctx);
      },
      editMyInformations(ctx) {
         const clientService = new EditUser();
         return clientService.editUser(ctx);
      },
      listMyInformations(ctx) {
         const clientService = new ListUsers();
         return clientService.listMyInformations(ctx);
      }
   }),
);
