const express = require('express');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const cashesValidation = require('./validations/cashes');
const cashesIdValidation = require('./validations/cashes_id');
const getCashesValidation = require('./validations/get_cashes');
const validationCheck = require('../middlewares/validationCheck');
const cashDAO = require('./cash.dao');
const usageDAO = require('./usage.dao');
const Cash = require('./cash.model');
const Usage = require('./usage.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';




/**
 * Total Cash
 */
 router.get(`/${apiVersion}/cashes-total`, 
    api('Get Total Cash'),
    auth([User.ROLE_MANAGER]),
    async (req, res) => {
        try {

            const total = await cashDAO.findTotal();

            return req.api.status(200)
                .send(total);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);

/**
 * Create a Cash
 */
 router.post(`/${apiVersion}/cashes`, 
    api('Create a Cash'),
    auth([User.ROLE_MANAGER]),
    cashesValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            const cash = await cashDAO.insert(data = {
                amount: req.body.amount,
                purpose: req.body.purpose,
            });

            return req.api.status(200)
                .send(cash);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Update a Cash
 */
 router.post(`/${apiVersion}/cashes/:id`, 
    api('Update a Cash'),
    auth([User.ROLE_MANAGER]),
    cashesIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if acc exists
            const cashes = await cashDAO.find(where = {
                id: req.params.id,
            });

            if (cashes.length == 0) {
                return req.api.status(404).errors([
                    'Cash Not Found!'
                ]).send();
            }

            const usages = await usageDAO.find(where = {
                cashId: req.params.id,
            });

            if (usages.length > 0) {
                return req.api.status(400).errors([
                    'Cash With Usage cannot be edited!'
                ]).send();
            }

            const u = cashes[0];

            const updatedUsers = await cashDAO.update(
                data= {
                    amount: req.body.amount,
                    purpose: req.body.purpose, 
                },
                where= { id: u.id }
            )

            // console.log(updatedUsers);

            return req.api.status(200)
                .send(updatedUsers[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Get Cash Listing
 */
 router.get(`/${apiVersion}/cashes`, 
    api('Get Cash Listing'),
    auth([User.ROLE_MANAGER]),
    getCashesValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const cashes = await cashDAO.find(
                where= {},
                options= {limit: limit, skip: skip}
            );

            const total = await cashDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(cashes.length)
                .total(total)
                .send(cashes);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router