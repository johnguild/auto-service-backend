const express = require('express');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const usagesValidation = require('./validations/usages');
const usagesIdValidation = require('./validations/usages_id');
const getUsagesValidation = require('./validations/get_usages');
const getUsagesAllValidation = require('./validations/get_usages_all');
const validationCheck = require('../middlewares/validationCheck');
const usageDAO = require('./usage.dao');
const cashDAO = require('./cash.dao');
const Usage = require('./usage.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';

/**
 * Create a Usage
 */
 router.post(`/${apiVersion}/usages`, 
    api('Create a Usage'),
    auth([User.ROLE_MANAGER]),
    usagesValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            // check if cash exists
            const cashes = await cashDAO.find( where = {
                id: req.body.cashId,
            });

            if (cashes.length == 0 ) {
                return req.api.status(400).errors([
                    'Invalid Cash! Not Found!'
                ]).send();
            }

            const cash = cashes[0];
            if (parseFloat(cash.amount) < req.body.amount) {
                return req.api.status(400).errors([
                    'Amount should not be greater than the available cash'
                ]).send();
            }

            const usage = await usageDAO.insert(data = {
                cashId: cash.id,
                amount: req.body.amount,
                purpose: req.body.purpose,
            });

            await cashDAO.update(
                data = {
                    amount: (parseFloat(cash.amount) - req.body.amount),
                },
                where = {
                    id: cash.id,
                }
            );

            return req.api.status(200)
                .send(usage);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Update a Usage
 */
 router.post(`/${apiVersion}/usages/:id`, 
    api('Update a Usage'),
    auth([User.ROLE_MANAGER]),
    usagesIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if acc exists
            const usages = await usageDAO.find(where = {
                id: req.params.id,
            });

            if (usages.length == 0) {
                return req.api.status(404).errors([
                    'Usage Not Found!'
                ]).send();
            }

            const u = usages[0];

            // check if cash amount still ok
            const cashes = await cashDAO.find( where = {
                id: u.cashId,
            });

            if (cashes.length == 0 ) {
                return req.api.status(400).errors([
                    'Invalid Cash! Not Found!'
                ]).send();
            }

            if ((parseFloat(u.amount) + parseFloat(cashes[0].amount)) < req.body.amount) {
                return req.api.status(400).errors([
                    'Amount should not be greater than the available cash'
                ]).send();
            }
            
            await cashDAO.update(
                data = {
                    amount: ((parseFloat(u.amount) + parseFloat(cashes[0].amount)) - req.body.amount)
                },
                where = {
                    id: cashes[0].id
                }
            );
    
            const updatedUsers = await usageDAO.update(
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
 * Get Usage Listing
 */
 router.get(`/${apiVersion}/usages`, 
    api('Get Usage Listing'),
    auth([User.ROLE_MANAGER]),
    getUsagesValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            // check if cash exists
            const cashes = await cashDAO.find( where = {
                id: req.query.cashId,
            });

            if (cashes.length == 0 ) {
                return req.api.status(400).errors([
                    'Invalid Cash! Not Found!'
                ]).send();
            }


            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const usagees = await usageDAO.find(
                where= { cashId: req.body.cashId },
                options= {limit: limit, skip: skip}
            );

            const total = await usageDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(usagees.length)
                .total(total)
                .send(usagees);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);



/**
 * Get Usage Listing
 */
 router.get(`/${apiVersion}/usages-all`, 
    api('Get Usage Listing'),
    auth([User.ROLE_MANAGER]),
    getUsagesAllValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const usagees = await usageDAO.find(
                where= { },
                options= {limit: limit, skip: skip}
            );

            const total = await usageDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(usagees.length)
                .total(total)
                .send(usagees);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router