const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const ordersValidation = require('./validations/orders');
// const ordersIdValidation = require('./validations/orders_id');
const getOrdersValidation = require('./validations/get_orders');
const validationCheck = require('../middlewares/validationCheck');
const orderDAO = require('./order.dao');
const serviceDAO = require('../service/service.dao');
const userDAO = require('../user/user.dao');
const Order = require('./order.model');
const User = require('../user/user.model');
const { options } = require('pg/lib/defaults');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Order
 */
 router.post(`/${apiVersion}/orders`, 
    api('Create a Order'),
    auth([User.ROLE_MANAGER]),
    ordersValidation(),
    validationCheck(),
    async (req, res) => {
        try {


            const users = await userDAO.find(
                where = {
                    id: req.body.customerId,
                    role: User.ROLE_CUSTOMER,
                }
            );

            if (users.length == 0) {
                return req.api.status(404).errors([
                    'Customer does not exists'
                ]).send();
            }

            let hasInvalidService = false;
            const currentServices = [];
            for (const serviceId of req.body.services) {
                const services = await serviceDAO.find(
                    where = {
                        id: serviceId,
                        isPublic: true,
                    }
                );
                if (services.length == 0) {
                    hasInvalidService = true;
                } else {
                    currentServices.push(services[0]);
                }
            }
            if (hasInvalidService) {
                return req.api.status(400).errors([
                    'Invalid Service Selected'
                ]).send();
            }


            const order = await orderDAO.insertOrder(
                data = {
                    customerId: users[0].id,
                    installments: req.body.installments,
                    carBrand: req.body.carBrand,
                    carModel: req.body.carModel,
                    carColor: req.body.carColor,
                    carPlate: req.body.carPlate,
                    total: 0// temp
                }
            );

            for (const service of currentServices) {
                await orderDAO.insertOrderService(
                        data = {
                        orderId: order.id,
                        serviceId: service.id,
                        price: service.discountedPrice > 0 ? service.discountedPrice : service.price,
                    }
                );
            }

            return req.api.status(200)
                .send(order);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



// /**
//  * Update a Order
//  */
//  router.post(`/${apiVersion}/orders/:id`, 
//     api('Update a Order'),
//     auth([User.ROLE_PERSONNEL]),
//     ordersIdValidation(),
//     validationCheck(),
//     async (req, res) => {
//         // console.log(req.params.id);
//         try {

//             /// check if order exists
//             const orders = await orderDAO.find(where = {
//                 id: req.params.id,
//             });

//             if (orders.length == 0) {
//                 return req.api.status(404).errors([
//                     'Order Not Found!'
//                 ]).send();
//             }

//             const s = orders[0];

//             /// check if sku is available 
//             const dupSKU = await orderDAO.find(where = {
//                 sku: req.body.sku,
//             });

//             if (dupSKU.length > 0) {
//                 let alreadyTaken = false;
//                 dupSKU.forEach(prod => {
//                     if (prod.id != s.id && prod.sku == req.body.sku) {
//                         alreadyTaken = true;
//                     }
//                 });
//                 if (alreadyTaken) {
//                     return req.api.status(400).errors([
//                         'SKU already taken!'
//                     ]).send();
//                 }
//             }

//             const updatedOrders = await orderDAO.update(
//                 data= {
//                     name: req.body.name,
//                     sku: req.body.sku,
//                     description: req.body.description,
//                     stock: req.body.stock,
//                     price: req.body.price,
//                 },
//                 where= { id: s.id }
//             )

//             // console.log(updatedOrders);

//             return req.api.status(200)
//                 .send(updatedOrders[0]);

//         } catch (error) {
//             // console.log(error);
//             return req.api.status(422).errors([
//                 'Failed processing request. Pleast try again!'
//             ]).send();
//         }


//     }
// );




/**
 * Get Order Listing
 */
 router.get(`/${apiVersion}/orders`, 
    api('Get Order Listing'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getOrdersValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            // console.log(limit, skip);
            /// check if acc exists
            const allOrders = await orderDAO.find(
                where ={},
                opt ={limit: limit, skip: skip},
            );

            const total = await orderDAO.findCount(
                where= {}
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(allOrders.length)
                .total(total)
                .send(allOrders);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);



/**
 * Get Customer Orders 
 */
 router.get(`/${apiVersion}/my-orders`, 
    api('Get My Order'),
    auth([User.ROLE_CUSTOMER]),
    getOrdersValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            
            /// check if acc exists
            const orders = await orderDAO.find(
                where= { customerId: req.user.id },
                opt= {limit: limit, skip: skip}
            );

            const total = await orderDAO.findCount(
                where= { customerId: req.user.id }
            );

            // console.log(total);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(orders.length)
                .total(total)
                .send(orders);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);

module.exports = router