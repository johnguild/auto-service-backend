const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const toolsValidation = require('./validations/tools');
const toolsIdValidation = require('./validations/tools_id');
const getToolsValidation = require('./validations/get_tools');
const validationCheck = require('../middlewares/validationCheck');
const toolDAO = require('./tool.dao');
const Tool = require('./tool.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Tool
 */
 router.post(`/${apiVersion}/tools`, 
    api('Create a Tool'),
    auth([User.ROLE_CLERK]),
    toolsValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            const tool = await toolDAO.insert(
                data = {
                    name: req.body.name,
                    description: req.body.description,
                    cover: req.body.cover,
                    quantity: req.body.quantity,
                    available: req.body.quantity,// TODO
                }
            )

            return req.api.status(200)
                .send(tool);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



/**
 * Update a Tool
 */
 router.post(`/${apiVersion}/tools/:id`, 
    api('Update a Tool'),
    auth([User.ROLE_CLERK]),
    toolsIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if tool exists
            const tools = await toolDAO.find(where = {
                id: req.params.id,
            });

            if (tools.length == 0) {
                return req.api.status(404).errors([
                    'Tool Not Found!'
                ]).send();
            }

            const s = tools[0];

            const currentLent = parseFloat(s.quantity) - parseFloat(s.available);
            if (parseFloat(req.body.quantity) < currentLent) {
                return req.api.status(404).errors([
                    'New quantity must be greater than the current available'
                ]).send();
            }

            const updatedTools = await toolDAO.update(
                data= {
                    name: req.body.name,
                    description: req.body.description,
                    cover: req.body.cover,
                    quantity: req.body.quantity,
                    available: parseFloat(req.body.quantity) - currentLent,
                },
                where= { id: s.id }
            )

            // console.log(updatedTools);

            return req.api.status(200)
                .send(updatedTools[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);




/**
 * Get Tool Listing
 */
 router.get(`/${apiVersion}/tools`, 
    api('Get Tool Listing'),
    auth([User.ROLE_CLERK]),
    getToolsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            const likeQry = req.query.keyword ? req.query.keyword : undefined;
            
            /// check if acc exists
            const tools = await toolDAO.find(
                where= {},
                options= {
                    limit: limit, 
                    skip: skip, 
                    like: likeQry
                }
            );

            const total = await toolDAO.findCount(
                where= {},
                options= {
                    like: likeQry
                }
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(tools.length)
                .total(total)
                .send(tools);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router