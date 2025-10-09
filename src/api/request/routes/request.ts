/**
 * request router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::request.request');

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/requests",
            handler: "request.create"
        },
        {
            method: "GET",
            path: "/requests",
            handler: "request.find"
        },
        {
            method: "GET",
            path: "/requests/:id",
            handler: "request.findOne"
        },
        {
            method: "PUT",
            path: "/requests/:id",
            handler: "request.update"
        },
        {
            method: "DELETE",
            path: "/requests/:id",
            handler: "request.delete"
        },
        {
            method: "GET",
            path: "/listMyRequests",
            handler: "request.listMyRequests"
        },
        {
            method: "PUT",
            path: "/respondRequest/:id",
            handler: "request.respondRequest"
        },
        {
            method: "GET",
            path: "/exportRequestPdf/:id",
            handler: "request.exportRequestPdf"
        }
    ]
};