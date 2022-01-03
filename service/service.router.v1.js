const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const servicesValidation = require('./validations/services');
const servicesIdValidation = require('./validations/services_id');
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
 router.post(`/${apiVersion}/service/:id`, 
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
                },
                where= { id: s.id }
            )

            // console.log(updatedServices);

            return req.api.status(200)
                .send(updatedServices[0]);

        } catch (error) {
            console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);


module.exports = router