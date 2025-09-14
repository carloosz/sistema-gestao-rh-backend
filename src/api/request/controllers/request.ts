/**
 * request controller
 */

import { factories } from '@strapi/strapi'
import { CreateRequest } from '../services/CreateRequest';
import { ListRequests } from '../services/ListRequests';

export default factories.createCoreController('api::request.request', ({ strapi }) => ({
    create(ctx) {
        const requestService = new CreateRequest();
        return requestService.createRequest(ctx);
    },
    listMyRequests(ctx) {
        const requestService = new ListRequests();
        return requestService.listMyRequests(ctx);
    },
    find (ctx) {
        const requestService = new ListRequests();
        return requestService.listRequestsMaster(ctx);
    },
    findOne (ctx) {
        const requestService = new ListRequests();
        return requestService.listRequestDetails(ctx);
    },
    update (ctx) {
        
    },
    delete (ctx) {
        
    }
}));
