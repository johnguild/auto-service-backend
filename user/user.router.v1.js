const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const loginValidation = require('./validations/login');
const validationCheck = require('../middlewares/validationCheck');
const userDAO = require('./user.dao');
const User = require('./user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Login User
 */
 router.post(`/${apiVersion}/login`, 
    api('Login User'),
    loginValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            const users = await userDAO.find(where = {
                email: req.body.email,
                // password: req.body.password,
            });

            if (users.length == 0) {
                return req.api.status(404).errors([
                    'Credentials does not match our records'
                ]).send();
            }

            let userMatch = null;
            for (const user of users) {
                const isMatch = await bcrypt.compare(req.body.password, user.password);
                if (isMatch) userMatch = user;
            }

            if (userMatch.isDisabled) {
                return req.api.status(403).errors([
                    'User Account has been disabled'
                ]).send();
            }
          
            return req.api.status(200)
                .token(tokenator.generate({
                    userId: userMatch.id,
                }))
                .send(userMatch);

        } catch (error) {
            console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);


/**
 * Get User Details
 */
 router.get(`/${apiVersion}/me`, 
    api('Get User Details'),
    auth(),
    async (req, res) => {
        try {
            return req.api.status(200).send(req.user);
        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * TEST Only
 * Get User Details for manager only
 */
 router.get(`/${apiVersion}/manager`, 
    api('Get User Details'),
    auth([User.ROLE_MANAGER]),
    async (req, res) => {
        try {
            return req.api.status(200).send(req.user);
        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * TEST Only
 * Get User Details for customers only
 */
 router.get(`/${apiVersion}/customer`, 
    api('Get User Details'),
    auth([User.ROLE_CUSTOMER]),
    async (req, res) => {
        try {
            return req.api.status(200).send(req.user);
        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * TEST Only
 * Get User Details for manager or customers
 */
 router.get(`/${apiVersion}/manager-customer`, 
    api('Get User Details'),
    auth([User.ROLE_MANAGER, User.ROLE_CUSTOMER]),
    async (req, res) => {
        try {
            return req.api.status(200).send(req.user);
        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);

module.exports = router