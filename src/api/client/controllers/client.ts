/**
 * client controller
 */

import { factories } from '@strapi/strapi'
import { RegisterUser } from '../services/RegisterUser';

export default factories.createCoreController('api::client.client', ({ strapi }) => ({
    create (ctx) {
        const clientService = new RegisterUser();
        return clientService.registerUser(ctx);
    }
}));
