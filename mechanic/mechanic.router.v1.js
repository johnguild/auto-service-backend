const express = require('express');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const mechanicsValidation = require('./validations/mechanics');
const mechanicsIdValidation = require('./validations/mechanics_id');
const getMechanicsValidation = require('./validations/get_mechanics');
const validationCheck = require('../middlewares/validationCheck');
const mechanicDAO = require('./mechanic.dao');
const Mechanic = require('./mechanic.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Mechanic
 */
 router.post(`/${apiVersion}/mechanics`, 
    api('Create a Mechanic'),
    auth([User.ROLE_MANAGER]),
    mechanicsValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            const mechanic = await mechanicDAO.insert(data = {
                mobile: req.body.mobile,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                birthDay: req.body.birthDate,
            });

            return req.api.status(200)
                .send(mechanic);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Update a Mechanic
 */
 router.post(`/${apiVersion}/mechanics/:id`, 
    api('Update a Mechanic'),
    auth([User.ROLE_MANAGER]),
    mechanicsIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if acc exists
            const mechanics = await mechanicDAO.find(where = {
                id: req.params.id,
            });

            if (mechanics.length == 0) {
                return req.api.status(404).errors([
                    'Mechanic Not Found!'
                ]).send();
            }

            const u = mechanics[0];

            const updatedUsers = await mechanicDAO.update(
                data= {
                    mobile: req.body.mobile,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    birthDay: req.body.birthDate,
                    gender: req.body.gender,
                },
                where= { id: u.id }
            )

            // console.log(updatedUsers);

            return req.api.status(200)
                .send(updatedUsers[0]);

        } catch (error) {
            console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Get Mechanic Listing
 */
 router.get(`/${apiVersion}/mechanics`, 
    api('Get Mechanic Listing'),
    auth([User.ROLE_MANAGER]),
    getMechanicsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const mechanics = await mechanicDAO.find(
                where= {},
                options= {
                    limit: limit, 
                    skip: skip,
                    like: req.query.keyword ? req.query.keyword : undefined
                }
            );

            const total = await mechanicDAO.findCount(
                where= {},
                options= {
                    like: req.query.keyword ? req.query.keyword : undefined
                }
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(mechanics.length)
                .total(total)
                .send(mechanics);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router