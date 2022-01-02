const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const customersValidation = require('./validations/customers');
const customersIdValidation = require('./validations/customers_id');
const validationCheck = require('../middlewares/validationCheck');
const userDAO = require('./user.dao');
const User = require('./user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Customer Account
 */
 router.post(`/${apiVersion}/customers`, 
    api('Create a Customer Account'),
    auth([User.ROLE_MANAGER]),
    customersValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            /// check if email is available 
            const dupEmailAcc = await userDAO.find(where = {
                email: req.body.email,
            });

            if (dupEmailAcc.length > 0) {
                return req.api.status(400).errors([
                    'Email already taken!'
                ]).send();
            }
            

            /// encrypt password
            const encryptedPass = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));
            const user = await userDAO.insert(data = {
                email: req.body.email,
                password: encryptedPass,
                mobile: req.body.mobile,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                birthDay: req.body.birthDate,
                role: User.ROLE_CUSTOMER
            });

            return req.api.status(200)
                .send(user);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Update a Customer Account
 */
 router.post(`/${apiVersion}/customers/:id`, 
    api('Update a Customer Account'),
    auth([User.ROLE_MANAGER]),
    customersIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if acc exists
            const users = await userDAO.find(where = {
                id: req.params.id,
                role: User.ROLE_CUSTOMER,
            });

            if (users.length == 0) {
                return req.api.status(404).errors([
                    'Customer Not Found!'
                ]).send();
            }

            const u = users[0];



            /// check if email is available 
            const dupEmailAcc = await userDAO.find(where = {
                email: req.body.email,
            });

            if (dupEmailAcc.length > 0) {
                let alreadyTaken = false;
                dupEmailAcc.forEach(acc => {
                    if (acc.id != u.id && acc.email == req.body.email) {
                        alreadyTaken = true;
                    }
                });
                if (alreadyTaken) {
                    return req.api.status(400).errors([
                        'Email already taken!'
                    ]).send();
                }
            }

            let isDisabled;
            if (req.body.active != undefined) {
                isDisabled = !req.body.active;
            }
            

            const updatedUsers = await userDAO.update(
                data= {
                    email: req.body.email,
                    mobile: req.body.mobile,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    birthDay: req.body.birthDate,
                    gender: req.body.gender,
                    isDisabled: isDisabled 
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


module.exports = router