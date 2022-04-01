const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const personnelsValidation = require('./validations/personnels');
const personnelsIdValidation = require('./validations/personnels_id');
const getPersonnelsValidation = require('./validations/get_personnels');
const validationCheck = require('../middlewares/validationCheck');
const userDAO = require('./user.dao');
const User = require('./user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Personnel Account
 */
 router.post(`/${apiVersion}/personnels`, 
    api('Create a Personnel Account'),
    auth([User.ROLE_MANAGER]),
    personnelsValidation(),
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
                role: User.ROLE_PERSONNEL
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
 * Update a Personnel Account
 */
 router.post(`/${apiVersion}/personnels/:id`, 
    api('Update a Personnel Account'),
    auth([User.ROLE_MANAGER]),
    personnelsIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if acc exists
            const users = await userDAO.find(where = {
                id: req.params.id,
                role: User.ROLE_PERSONNEL,
            });

            if (users.length == 0) {
                return req.api.status(404).errors([
                    'Personnel Not Found!'
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

            const updatedUsers = await userDAO.update(
                data= {
                    email: req.body.email,
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
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Get Personnel Listing
 */
 router.get(`/${apiVersion}/personnels`, 
    api('Get Personnel Listing'),
    auth([User.ROLE_MANAGER]),
    getPersonnelsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const users = await userDAO.find(
                where= {role: User.ROLE_PERSONNEL},
                options= {
                    limit: limit, 
                    skip: skip,
                    like: req.query.keyword ? req.query.keyword : undefined
                }
            );

            const total = await userDAO.findCount(
                where= {role: User.ROLE_PERSONNEL},
                options= {
                    like: req.query.keyword ? req.query.keyword : undefined
                }
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(users.length)
                .total(total)
                .send(users);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router