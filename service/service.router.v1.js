const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const servicesValidation = require('./validations/services');
const servicesIdValidation = require('./validations/services_id');
const getServicesValidation = require('./validations/get_services');
const validationCheck = require('../middlewares/validationCheck');
const serviceDAO = require('./service.dao');
const Service = require('./service.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Service
 */
 router.post(`/${apiVersion}/services`, 
    api('Create a Service'),
    auth([User.ROLE_MANAGER]),
    servicesValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            const service = await serviceDAO.insert(
                data = {
                    title: req.body.title,
                    description: req.body.description,
                    cover: req.body.cover,
                    price: req.body.price,
                    discountedPrice: req.body.discountedPrice,
                    isPublic: req.body.isPublic,
                    products: req.body.products,
                }
            )

            return req.api.status(200)
                .send(service);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



/**
 * Update a Service
 */
 router.post(`/${apiVersion}/services/:id`, 
    api('Update a Service'),
    auth([User.ROLE_MANAGER]),
    servicesIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if acc exists
            const services = await serviceDAO.find(where = {
                id: req.params.id,
                role: Service.ROLE_PERSONNEL,
            });

            if (services.length == 0) {
                return req.api.status(404).errors([
                    'Service Not Found!'
                ]).send();
            }

            const s = services[0];

            const updatedServices = await serviceDAO.update(
                data= {
                    title: req.body.title,
                    description: req.body.description,
                    cover: req.body.cover,
                    price: req.body.price,
                    discountedPrice: req.body.discountedPrice,
                    isPublic: req.body.isPublic,
                    products: req.body.products,
                },
                where= { id: s.id }
            )

            // console.log(updatedServices);

            return req.api.status(200)
                .send(updatedServices[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);




/**
 * Get Service Listing
 */
 router.get(`/${apiVersion}/services`, 
    api('Get Service Listing'),
    auth([User.ROLE_MANAGER]),
    getServicesValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const services = await serviceDAO.find(
                where= {},
                options= {limit: limit, skip: skip}
            );

            const total = await serviceDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(services.length)
                .total(total)
                .send(services);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);



/**
 * Get Service Listing
 */
 router.get(`/${apiVersion}/public-services`, 
    api('Get Service Listing'),
    getServicesValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const services = await serviceDAO.find(
                where= { isPublic: true },
                options= {limit: limit, skip: skip}
            );

            const total = await serviceDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(services.length)
                .total(total)
                .send(services);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);

module.exports = router