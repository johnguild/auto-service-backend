const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const ordersValidation = require('./validations/orders');
const paymentsValidation = require('./validations/payments');
const servicesValidation = require('./validations/services');
const completeValidation = require('./validations/complete');
// const ordersIdValidation = require('./validations/orders_id');
const getOrdersValidation = require('./validations/get_orders');
const validationCheck = require('../middlewares/validationCheck');
const orderDAO = require('./order.dao');
const serviceDAO = require('../service/service.dao');
const productDAO = require('../product/product.dao');
const stockDAO = require('../stock/stock.dao');
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

            /// check if stocks are available
            const tmpServiceProductIds = [];
            const tmpServiceProductQuantities = [];
            if (req.body.services.length > 0) {
                for (const bodyService of req.body.services) {
                    if (bodyService.addedProducts.length > 0) {
                        for (const bodyProduct of bodyService.addedProducts) {
                            // console.log(bodyProduct);
                            // console.log(tmpServiceProductIds.includes(bodyProduct.id));
                            if (tmpServiceProductIds.includes(bodyProduct.id)) {
                                const indexOf = tmpServiceProductIds.indexOf(bodyProduct.id);
                                tmpServiceProductQuantities[indexOf] += parseInt(bodyProduct.quantity);
                            } else {
                                // console.log('add');
                                tmpServiceProductIds.push(bodyProduct.id);
                                tmpServiceProductQuantities.push(parseInt(bodyProduct.quantity));
                            }
                            // total += parseFloat(bodyProduct.price) * parseFloat(bodyProduct.quantity);
                        }
                    }
                }
            }

            let hasInsufficientStock = false;
            for (const productId of tmpServiceProductIds) {
                const indexOf = tmpServiceProductIds.indexOf(productId);
                const totalQuantity = tmpServiceProductQuantities[indexOf];

                let stockTotal = await stockDAO.findTotalQuantity(where = {productId: productId});

                // console.log(productId, totalQuantity, stockTotal);
                if (totalQuantity > stockTotal) {
                    hasInsufficientStock = true;
                }
            }

            if (hasInsufficientStock) {
                return req.api.status(400).errors([
                    'Inventory quantity exceeds Stocks available!'
                ]).send();
            }

            /// comput the total
            let partTotal = 0, serviceTotal = 0;
            for (const bodyService of req.body.services) {
                serviceTotal += parseFloat(bodyService.price);
                if (bodyService.addedProducts.length > 0) {
                    for (const bodyProduct of bodyService.addedProducts) {
                        partTotal += parseInt(bodyProduct.quantity) * parseFloat(bodyProduct.price);
                    }
                }
            }

            // console.log(tmpServiceProductIds, tmpServiceProductQuantities);

            const order = await orderDAO.insertOrder(
                data = {
                    customerId: users[0].id,
                    carMake: req.body.carMake,
                    carType: req.body.carType,
                    carYear: req.body.carYear,
                    carPlate: req.body.carPlate,
                    carOdometer: req.body.carOdometer,
                    receiveDate: req.body.receiveDate,
                    warrantyEnd: req.body.warrantyEnd,
                    total: (partTotal + serviceTotal)
                }
            );

            
            if (req.body.services.length > 0) {
                let index = 0;
                for (const bodyService of req.body.services) {
                    await orderDAO.insertOrderService(
                        data = {
                            orderId: order.id,
                            serviceId: bodyService.id,
                            price: bodyService.price,
                        }
                    );
    
                    if (req.body.services[index].addedProducts.length > 0) {

                        for (const bodyProduct of req.body.services[index].addedProducts) {
                            await orderDAO.insertOrderProduct(
                                data = {
                                    orderId: order.id,
                                    serviceId: bodyService.id,
                                    productId: bodyProduct.id,
                                    price: bodyProduct.price,
                                    quantity: bodyProduct.quantity,
                                }
                            );
                        }
                    }
    
                    index++;
                }
            }

            if (req.body.mechanics.length > 0) {
                for (const bodyMechanic of req.body.mechanics) {
                    await orderDAO.insertOrderMechanic(
                        data = {
                            orderId: order.id,
                            mechanicId: bodyMechanic.id,
                        }
                    );
                }
            }

            // console.log(`deduct stock`);
            for (const productId of tmpServiceProductIds) {
                const indexOf = tmpServiceProductIds.indexOf(productId);
                let totalQuantity = tmpServiceProductQuantities[indexOf];

                const stocks = await stockDAO.find(where = {productId: productId});
                for (const stock of stocks) {
                    if (totalQuantity == 0) {
                        continue;
                    }
                    const stockQty = parseInt(stock.quantity);
                    // console.log(stockQty, totalQuantity, stock.id);
                    if (totalQuantity <= stockQty ) {
                        // console.log(`less than available stocks`);
                        await stockDAO.update(
                            data = {
                                quantity: (stockQty - totalQuantity),
                            },
                            where = {
                                id: stock.id,
                            }
                        );
                        totalQuantity = 0;
                    } else {
                        // console.log(`greater than available stocks`);
                        await stockDAO.update(
                            data = {
                                quantity: 0,
                            },
                            where = {
                                id: stock.id,
                            }
                        );
                        totalQuantity -= stockQty;
                    }
                 
                }
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



/**
 * Add Order Service
 */
 router.post(`/${apiVersion}/orders/:id/services`, 
    api('Add Order Service'),
    auth([User.ROLE_MANAGER]),
    servicesValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if order exists
            const orders = await orderDAO.find(where = {
                id: req.params.id,
                completed: false,
            });

            if (orders.length == 0) {
                return req.api.status(404).errors([
                    'Order Not Found!'
                ]).send();
            }

            const order = orders[0];

            if (req.body.services.length > 0) {
                let index = 0;
                for (const bodyService of req.body.services) {
                    await orderDAO.insertOrderService(
                        data = {
                            orderId: order.id,
                            serviceId: bodyService.id,
                            price: bodyService.price,
                        }
                    );
    
                    if (req.body.services[index].products.length > 0) {

                        for (const bodyProduct of req.body.services[index].products) {
                            await orderDAO.insertOrderProduct(
                                data = {
                                    orderId: order.id,
                                    serviceId: bodyService.id,
                                    productId: bodyProduct.id,
                                    price: bodyProduct.price,
                                    quantity: bodyProduct.quantity,
                                }
                            );
                        }
                    }
    
                    index++;
                }
            }

            // const tmpOrders = await orderDAO.find(where = {
            //     id: req.params.id,
            // });

            // console.dir(tmpOrders, {depth: null});

            return req.api.status(200).send();

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);




/**
 * Add Order Payment
 */
 router.post(`/${apiVersion}/orders/:id/payments`, 
    api('Add Order Payment'),
    auth([User.ROLE_MANAGER]),
    paymentsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if order exists
            const orders = await orderDAO.find(where = {
                id: req.params.id,
                completed: false,
            });

            if (orders.length == 0) {
                return req.api.status(404).errors([
                    'Order Not Found!'
                ]).send();
            }

            const s = orders[0];

            await orderDAO.insertOrderPayment(
                data= {
                    orderId: s.id,
                    amount: req.body.amount,
                    dateTime: new Date().toISOString(),
                }
            )

            // const tmpOrders = await orderDAO.find(where = {
            //     id: req.params.id,
            // });

            // console.dir(tmpOrders, {depth: null});

            return req.api.status(200).send();

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);




/**
 * Complete Order
 */
 router.post(`/${apiVersion}/orders/:id/complete`, 
    api('Complete the Order'),
    auth([User.ROLE_MANAGER]),
    completeValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if order exists
            const orders = await orderDAO.find(where = {
                id: req.params.id,
                completed: false,
            });

            if (orders.length == 0) {
                return req.api.status(404).errors([
                    'Order Not Found!'
                ]).send();
            }

            const o = orders[0];

            await orderDAO.updateOrder(
                data= {
                    completed: true
                },
                where= {
                    id: o.id
                }
            )

            // const tmpOrders = await orderDAO.find(where = {
            //     id: req.params.id,
            // });

            // console.dir(tmpOrders, {depth: null});

            return req.api.status(200).send();

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
            // console.dir(allOrders, {depth:null});

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(allOrders.length)
                .total(total)
                .send(allOrders);

        } catch (error) {
            console.log(error);
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