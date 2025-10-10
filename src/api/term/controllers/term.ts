/**
 * term controller
 */

import { factories } from '@strapi/strapi'
import { ListTerm } from '../services/ListTerm';

export default factories.createCoreController('api::term.term', ({ strapi }) => ({
    async find() {
        return new ListTerm().execute();
    }
}));
