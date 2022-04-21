const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const lendsValidation = require('./validations/lends');
const lendsIdValidation = require('./validations/lends_id');
const lendsIdRemitValidation = require('./validations/lends_id_remit');
const getLendsValidation = require('./validations/get_lends');
const validationCheck = require('../middlewares/validationCheck');
const lendDAO = require('./lend.dao');
const Lend = require('./lend.model');
const User = require('../user/user.model');

const toolDAO = require('../tool/tool.dao');
const mechanicDAO = require('../mechanic/mechanic.dao');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Lend a tool to mechanic
 */
 router.post(`/${apiVersion}/lends`, 
    api('Lend a tool to mechanic'),
    auth([User.ROLE_CLERK]),
    lendsValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            // check if mechanic exists
            const mechanics = await mechanicDAO.find(where= {id: req.body.mechanicId}, options={limit: 1});
            if (mechanics.length == 0) {
                return req.api.status(400).errors([
                    'Mechanic Not Found!'
                ]).send();
            }
            
            // check if tools exists
            const tools = await toolDAO.find(where= {id: req.body.toolId}, options={limit: 1});
            if (tools.length == 0) {
                return req.api.status(400).errors([
                    'Tool Not Found!'
                ]).send();
            }

            // check if tool available enough
            if (parseInt(tools[0].available) < parseInt(req.body.quantity)) {
                return req.api.status(400).errors([
                    'Tool available is not enough!'
                ]).send();
            }


            // crate instance
            const lend = await lendDAO.insert(
                data = {
                    toolId: tools[0].id,
                    mechanicId: mechanics[0].id,
                    quantity: req.body.quantity,
                    borrowedAt: new Date().toISOString(),
                }
            )

            // update tool available
            await toolDAO.update(
                data= {available:  (parseFloat(tools[0].available) - parseFloat(lend.quantity))},
                where= {id: tools[0].id}
            )

            return req.api.status(200)
                .send(lend);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



/**
 * Update a Lend
 */
 router.post(`/${apiVersion}/lends/:id`, 
    api('Update a Lend'),
    auth([User.ROLE_CLERK]),
    lendsIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if lend exists
            const lends = await lendDAO.find(where = {
                id: req.params.id,
            });

            if (lends.length == 0) {
                return req.api.status(404).errors([
                    'Lend Not Found!'
                ]).send();
            }

            const lend = lends[0];

            // check if tool available enough
            const tools = await toolDAO.find(where= { id: lend.toolId }, options= {limit: 1});
            const tool = tools[0];

            /// (currentAvail + previousQuantity) < newQuantity
            if ((parseInt(tool.available) + parseInt(lend.quantity)) < parseInt(req.body.quantity) ) {
                return req.api.status(400).errors([
                    'Tool available is not enough!'
                ]).send();
            }

            // udpate lend
            const updatedLends = await lendDAO.update(
                data= {
                    quantity: req.body.quantity
                },
                where= { id: lend.id }
            )

            // update tool available
            await toolDAO.update(
                data= {
                    available: ((parseInt(tool.available) + parseInt(lend.quantity)) - parseInt(req.body.quantity))
                },
                where= { id: tool.id }
            )

            return req.api.status(200)
                .send(updatedLends[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Remit/Return a lended tool
 */
 router.post(`/${apiVersion}/lends/:id/remit`, 
    api('Remit a Lended tool'),
    auth([User.ROLE_CLERK]),
    lendsIdRemitValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if lend exists
            const lends = await lendDAO.find(where = {
                id: req.params.id,
            });

            if (lends.length == 0) {
                return req.api.status(404).errors([
                    'Lend Not Found!'
                ]).send();
            }

            const lend = lends[0];

            // udpate lend
            const updatedLends = await lendDAO.update(
                data= {
                    remittedAt: new Date().toISOString(), 
                },
                where= { id: lend.id }
            )

            const tools = await toolDAO.find(where= { id: lend.toolId }, options= {limit: 1});
            const tool = tools[0];

            // update tool available
            await toolDAO.update(
                data= {
                    available: (parseInt(tool.available) + parseInt(lend.quantity))
                },
                where= { id: tool.id }
            )

            return req.api.status(200)
                .send(updatedLends[0]);

        } catch (error) {
            console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Get Lend Listing
 */
 router.get(`/${apiVersion}/lends`, 
    api('Get Lend Listing'),
    auth([User.ROLE_CLERK, User.ROLE_MANAGER]),
    getLendsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const lends = await lendDAO.find(
                where= {
                    toolId: req.query.toolId ? req.query.toolId : undefined, 
                    mechanicId: req.query.mechanicId ? req.query.mechanicId : undefined, 
                },
                options= {limit: limit, skip: skip}
            );

            const total = await lendDAO.findCount(
                where= {
                    toolId: req.query.toolId ? req.query.toolId : undefined, 
                    mechanicId: req.query.mechanicId ? req.query.mechanicId : undefined, 
                }
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(lends.length)
                .total(total)
                .send(lends);

        } catch (error) {
            console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router