/**
 * client controller
 */

import { factories } from '@strapi/strapi'
import { RegisterUser } from '../services/RegisterUser';
import { ListUsers } from '../services/ListUsers';

export default factories.createCoreController('api::client.client', ({ strapi }) => ({
    create (ctx) {
        const clientService = new RegisterUser();
        return clientService.registerUser(ctx);
    },
    find (ctx) {
        const clientService = new ListUsers();
        return clientService.listUsers(ctx);
    }
}));
