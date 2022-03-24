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
const getOrdersTotalValidation = require('./validations/get_orders_total');
const getOrdersReportValidation = require('./validations/get_orders_report');
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

            if (req.body.payment) {
                await orderDAO.insertOrderPayment(
                    data = {
                        orderId: order.id,
                        type: req.body.payment.type,
                        bank: req.body.payment.type == 'Online' 
                            ? req.body.payment.bank
                            : undefined,
                        referenceNumber: req.body.payment.type == 'Online' 
                            ? req.body.payment.referenceNumber
                            : undefined,
                        amount: req.body.payment.amount,
                        dateTime: new Date().toISOString(),
                    }
                )
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
            console.log(error);
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
                    type: req.body.type,
                    bank: req.body.type == 'Online' 
                        ? req.body.bank
                        : undefined,
                    referenceNumber: req.body.type == 'Online' 
                        ? req.body.referenceNumber
                        : undefined,
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
            console.log(error);
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
 * Get Order Listing
 */
 router.get(`/${apiVersion}/orders-total`, 
    api('Get Order total'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getOrdersTotalValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            const getStartEnd = (dateTime, dateType) => {
                let start, end;
                const tmpDateTime = new Date(dateTime);
                tmpDateTime.setHours(0,0,0,0);
                switch(dateType) {
                    case 'Year':
                        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
                        startOfYear.setHours(0,0,0,0);
                        start = new Date(startOfYear).toISOString();
                        const endOfYear = new Date(new Date().getFullYear(), 11, 31);
                        endOfYear.setHours(23,59,59,999);
                        end = new Date(endOfYear).toISOString();
                        break;
                    case 'Month':
                        const startOfMonth = new Date(tmpDateTime.getFullYear(), tmpDateTime.getMonth(), 1);
                        startOfMonth.setHours(0,0,0,0);
                        start = new Date(startOfMonth).toISOString();
                        const lastDay = new Date(tmpDateTime.getFullYear(), tmpDateTime.getMonth() + 1, 0);
                        const endOfMonth = new Date(lastDay);
                        endOfMonth.setHours(23,59,59,999);
                        end = new Date(endOfMonth).toISOString();
                        break;
                    case 'Week':
                        const today = tmpDateTime.getDate();
                        const dayOfTheWeek = tmpDateTime.getDay();
                        const firstDate = tmpDateTime.setDate(today - (dayOfTheWeek || 7));
                        const startOfWeek = new Date(firstDate);
                        startOfWeek.setHours(0,0,0,0);
                        start = new Date(startOfWeek).toISOString();
                        const lastDate = tmpDateTime.setDate(today - dayOfTheWeek + 7);
                        const endOfWeek = new Date(lastDate);
                        endOfWeek.setHours(23,59,59,999);
                        end = new Date(endOfWeek).toISOString();
                        break;
                    case 'Day':
                        start = new Date(tmpDateTime).toISOString();
                        tmpDateTime.setHours(23,59,59,999);
                        end = new Date(tmpDateTime).toISOString();
                        break;
                    case 'All':
                    default:
                        // set nothing
                        const startOfProj = new Date(2022, 0, 1, 0, 0, 0, 0);
                        start = new Date(startOfProj).toISOString();
                        tmpDateTime.setHours(23,59,59,999);
                        end = new Date(tmpDateTime).toISOString();
                        break;
                }
                return { start, end }
            }

            const range = getStartEnd(new Date(), req.query.type);

            // console.log(limit, skip);
            /// check if acc exists
            const total = await orderDAO.total(
                where ={
                    customerId: req.query.customerId,
                },
                opt ={
                    startDate: range.start,
                    endDate: range.end,
                },
            );

            // console.log(total);
            // console.dir(allOrders, {depth:null});

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
 * Get Order Report Data
 */
 router.get(`/${apiVersion}/orders-reports`, 
    api('Get Order Report Data'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getOrdersReportValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            const getStartEnd = (dateTime, dateType) => {
                let start, end;
                const tmpDateTime = new Date(dateTime);
                tmpDateTime.setHours(0,0,0,0);
                switch(dateType) {
                    case 'Year':
                        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
                        startOfYear.setHours(0,0,0,0);
                        start = new Date(startOfYear).toISOString();
                        const endOfYear = new Date(new Date().getFullYear(), 11, 31);
                        endOfYear.setHours(23,59,59,999);
                        end = new Date(endOfYear).toISOString();
                        break;
                    case 'Month':
                        const startOfMonth = new Date(tmpDateTime.getFullYear(), tmpDateTime.getMonth(), 1);
                        startOfMonth.setHours(0,0,0,0);
                        start = new Date(startOfMonth).toISOString();
                        const lastDay = new Date(tmpDateTime.getFullYear(), tmpDateTime.getMonth() + 1, 0);
                        const endOfMonth = new Date(lastDay);
                        endOfMonth.setHours(23,59,59,999);
                        end = new Date(endOfMonth).toISOString();
                        break;
                    case 'Week':
                        const today = tmpDateTime.getDate();
                        const dayOfTheWeek = tmpDateTime.getDay();
                        const firstDate = tmpDateTime.setDate(today - (dayOfTheWeek || 7));
                        const startOfWeek = new Date(firstDate);
                        startOfWeek.setHours(0,0,0,0);
                        start = new Date(startOfWeek).toISOString();
                        const lastDate = tmpDateTime.setDate(today - dayOfTheWeek + 7);
                        const endOfWeek = new Date(lastDate);
                        endOfWeek.setHours(23,59,59,999);
                        end = new Date(endOfWeek).toISOString();
                        break;
                    case 'Day':
                        start = new Date(tmpDateTime).toISOString();
                        tmpDateTime.setHours(23,59,59,999);
                        end = new Date(tmpDateTime).toISOString();
                        break;
                    case 'All':
                    default:
                        // set nothing
                        const startOfProj = new Date(2022, 0, 1, 0, 0, 0, 0);
                        start = new Date(startOfProj).toISOString();
                        tmpDateTime.setHours(23,59,59,999);
                        end = new Date(tmpDateTime).toISOString();
                        break;
                }
                return { start, end }
            }

            const range = getStartEnd(new Date(), req.query.type);

            // console.log(limit, skip);
            /// check if acc exists
            const orders = await orderDAO.find(
                where ={
                    customerId: req.query.customerId,
                    completed: req.query.completed,
                },
                opt ={
                    startDate: range.start,
                    endDate: range.end,
                },
            );

            // console.log(total);
            // console.dir(allOrders, {depth:null});

            return req.api.status(200)
                .send(orders);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * Get Order Mechanic Report Data
 */
 router.get(`/${apiVersion}/orders-mechanic-reports`, 
    api('Get Order Mechanic Report Data'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

        
            /// check if acc exists
            const mechanics = await orderDAO.findMechanicsWithOngoing();

            // console.log(total);
            // console.dir(allOrders, {depth:null});

            return req.api.status(200)
                .send(mechanics);

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