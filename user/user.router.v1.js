const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const loginValidation = require('./validations/login');
const updateProfileValidation = require('./validations/update_profile');
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

            // console.log(users);
            let userMatch = null;
            for (const user of users) {
                // console.log(user.password);
                const isMatch = await bcrypt.compare(req.body.password, user.password);
                if (isMatch) userMatch = user;
            }

            if (!userMatch) {
                return req.api.status(404).errors([
                    'Credentials does not match our records'
                ]).send();
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
            // console.log(error);
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
 * Update User
 */
 router.post(`/${apiVersion}/update-profile`, 
    api('Update User'),
    auth(),
    updateProfileValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            if (req.body.email) {
                /// check if email is available 
                const dupEmailAcc = await userDAO.find(where = {
                    email: req.body.email,
                });

                if (dupEmailAcc.length > 0) {
                    let hasDuplicate = false;
                    for (const sameEmailAcc of dupEmailAcc) {
                        if (sameEmailAcc.id != req.user.id) {
                            hasDuplicate = true;
                        }
                    }

                    if (hasDuplicate) {
                        return req.api.status(400).errors([
                            'Email already taken!'
                        ]).send();
                    }
                }
            }

            let encryptedPass;
            if (req.body.password) {
                /// encrypt password
                encryptedPass = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));
            }

            const users = await userDAO.update(
                data= {
                    email: req.body.email,
                    mobile: req.body.mobile,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    gender: req.body.gender,
                    birthDay: req.body.birthDate,
                    password: encryptedPass
                },
                where= {
                    id: req.user.id
                }
            );
        
            return req.api.status(200)
                .token(tokenator.generate({
                    userId: req.user.id,
                }))
                .send(users[0]);

        } catch (error) {
            console.log(error);
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