/**
 * client router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::client.client');

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/clients",
            handler: "client.create"
        },
        {
            method: "GET",
            path: "/clients",
            handler: "client.find"
        },
        {
            method: "GET",
            path: "/clients/:id",
            handler: "client.findOne"
        },
        {
            method: "PUT",
            path: "/dismissUser/:id",
            handler: "client.dismissUser"
        },
        {
            method: "PUT",
            path: "/clients/:id",
            handler: "client.update"
        },
        {
            method: "POST",
            path: "/forgotPassword",
            handler: "client.forgotPassword"
        },
        {
            method: "POST",
            path: "/resetPassword",
            handler: "client.resetPassword"
        }
    ]
};
