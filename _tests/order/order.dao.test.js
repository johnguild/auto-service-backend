const bcrypt = require('bcryptjs');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const User = require('../../user/user.model');
const Service = require('../../service/service.model');
const Product = require('../../product/product.model');
const Mechanic = require('../../mechanic/mechanic.model');
const Order = require('../../order/order.model');
const OrderServices = require('../../order/orderServices.model');
const OrderProducts = require('../../order/orderProducts.model');
const OrderPayments = require('../../order/orderPayments.model');
const OrderMechanics = require('../../order/orderMechanics.model');

const userDAO = require('../../user/user.dao');
const orderDAO = require('../../order/order.dao');
const serviceDAO = require('../../service/service.dao');
const productDAO = require('../../product/product.dao');
const mechanicDAO = require('../../mechanic/mechanic.dao');
const stockDAO = require('../../stock/stock.dao');

const managerData = {
    email: 'manager.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'password',
    firstName: 'Manager',
    lastName: 'Test',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_MANAGER,
}

const personnelData = {
    email: 'personnel.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'password',
    firstName: 'Personnel',
    lastName: 'Test',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_PERSONNEL,

}

const customerData = {
    email: 'customer.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'password',
    firstName: 'Customer',
    lastName: 'One',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_CUSTOMER,
}

const mechanicData = {
    mobile: '639359372676',
    firstName: 'Test Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
}


let managerUser, personnelUser, customerUser, mechanic;

const services = [];


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // clear db
    await migrate.up();


    /// create users
    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    managerUser = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });  


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnelUser = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });  


    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    customerUser = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  



    /// create services
    for (const service of [
        {
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string here',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 2',
            description: 'Something here',
            cover: 'base64string here',
            price: 99.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 3',
            description: 'Something here',
            cover: 'base64string here',
            price: 60.2,
            discountedPrice: undefined,
            isPublic: false,
        },
    ]) {
        const serviceInstance = await serviceDAO.insert(service);
        services.push(serviceInstance);
    }

    // create mechanic
    mechanic = await mechanicDAO.insert(mechanicData);
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Order.tableName};`);
    await pool.query(`DELETE FROM ${OrderServices.tableName};`);
    await pool.query(`DELETE FROM ${OrderProducts.tableName};`);
    await pool.query(`DELETE FROM ${OrderPayments.tableName};`);
    await pool.query(`DELETE FROM ${OrderMechanics.tableName};`);
});

afterAll( async() => {
    await migrate.down();
    await closePool();
});


describe('insertOrder', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const orderData = {
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        }

        let order;
        let err = null;
        try {
            order = await orderDAO.insertOrder(orderData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(order.customerId).toBe(orderData.customerId);
        expect(parseFloat(order.total)).toBe(orderData.total);
    });

});

describe('insertOrderServices', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });

        const service = await serviceDAO.insert({
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string here',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        });


        let orderService;
        let err = null;
        try {
            orderService = await orderDAO.insertOrderService(
                data = {
                    orderId: order.id, 
                    serviceId: service.id, 
                    price: service.price, 
                }
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderService.orderId).toBe(order.id);
        expect(orderService.serviceId).toBe(service.id)
        expect(orderService.price).toBe(service.price)
    });

});

describe('insertOrderProducts', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });


        const service = await serviceDAO.insert({
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string here',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        });

        const product = await productDAO.insert({
            name: 'Product 1',
            description: 'Description 1',
        });

        const stock = await stockDAO.insert({
            productId: product.id,
            personnelId: personnelUser.id,
            supplier: 'Test Supplier',
            quantity: 10,
            unitPrice: 120,
            sellingPrice: 150,
        });


        const productPrice = 333;
        const productQuantity = 2;


        let orderProduct;
        let err = null;
        try {
            orderProduct = await orderDAO.insertOrderProduct(
                data = {
                    orderId: order.id, 
                    serviceId: service.id,
                    productId: product.id, 
                    stockId: stock.id, 
                    price: productPrice, 
                    quantity: productQuantity,
                }
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderProduct.orderId).toBe(order.id);
        expect(orderProduct.serviceId).toBe(service.id);
        expect(orderProduct.productId).toBe(product.id);
        expect(orderProduct.stockId).toBe(stock.id);
        expect(orderProduct.price).toBe(productPrice.toString());
        expect(orderProduct.quantity).toBe(productQuantity.toString());
    });

});

describe('insertOrderPayments', () => {

    it('when creating with valid and Cash type, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });

        const paymentData = {
            orderId: order.id, 
            type: 'Cash',
            amount: 500, 
            dateTime: new Date().toISOString(), 
        }


        let orderPayment;
        let err = null;
        try {
            orderPayment = await orderDAO.insertOrderPayment(paymentData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderPayment.orderId).toBe(paymentData.orderId);
        expect(orderPayment.type).toBe(paymentData.type);
        expect(parseFloat(orderPayment.amount)).toBe(paymentData.amount);
        expect(orderPayment.dateTime.toISOString()).toBe(paymentData.dateTime);
    });

    it('when creating with valid and Online type, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });

        const paymentData = {
            orderId: order.id, 
            type: 'Online',
            bank: 'BDO',
            referenceNumber: 'BDO00012312',
            amount: 500, 
            dateTime: new Date().toISOString(), 
        }


        let orderPayment;
        let err = null;
        try {
            orderPayment = await orderDAO.insertOrderPayment(paymentData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderPayment.orderId).toBe(paymentData.orderId);
        expect(orderPayment.type).toBe(paymentData.type);
        expect(orderPayment.bank).toBe(paymentData.bank);
        expect(orderPayment.referenceNumber).toBe(paymentData.referenceNumber);
        expect(parseFloat(orderPayment.amount)).toBe(paymentData.amount);
        expect(orderPayment.dateTime.toISOString()).toBe(paymentData.dateTime);
    });

    it('when creating with valid and AccountsReceivable type, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });

        const paymentData = {
            orderId: order.id, 
            type: 'AccountsReceivable',
            amount: 500, 
            dateTime: new Date().toISOString(), 
        }


        let orderPayment;
        let err = null;
        try {
            orderPayment = await orderDAO.insertOrderPayment(paymentData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderPayment.orderId).toBe(paymentData.orderId);
        expect(orderPayment.type).toBe(paymentData.type);
        expect(parseFloat(orderPayment.amount)).toBe(paymentData.amount);
        expect(orderPayment.dateTime.toISOString()).toBe(paymentData.dateTime);
    });

    it('when creating with valid and Cheque type, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });

        const paymentData = {
            orderId: order.id, 
            type: 'Cheque',
            accountName: 'TestName',
            accountNumber: '091209312',
            chequeNumber: '1239123', 
            amount: 500, 
            dateTime: new Date().toISOString(), 
        }


        let orderPayment;
        let err = null;
        try {
            orderPayment = await orderDAO.insertOrderPayment(paymentData);
        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderPayment.orderId).toBe(paymentData.orderId);
        expect(orderPayment.type).toBe(paymentData.type);
        expect(parseFloat(orderPayment.amount)).toBe(paymentData.amount);
        expect(orderPayment.dateTime.toISOString()).toBe(paymentData.dateTime);
    });

});

describe('insertOrderMechanics', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        });

        const mechanicData = {
            orderId: order.id, 
            mechanicId: mechanic.id,
        }

        let orderMechanic;
        let err = null;
        try {
            orderMechanic = await orderDAO.insertOrderMechanic(mechanicData);

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderMechanic.orderId).toBe(mechanicData.orderId);
        expect(orderMechanic.mechanicId).toBe(mechanicData.mechanicId);
    });

})

describe('updateOrder', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const orderData = {
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: '2020 Camry',
            carYear: '2000',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        }

        const order2Data = {
            customerId: customerUser.id,
            total: 1200,
            carMake: 'Toyota',
            carType: 'VIOS',
            carYear: '1999',
            carPlate: '1234-ABCD',
            carOdometer: '6700',
        }
        // insert orderfirst
        const savedOrder = await orderDAO.insertOrder(orderData);
        await orderDAO.insertOrder(order2Data);

        let orders;
        let err = null;
        try {
            orders = await orderDAO.updateOrder(
                data = {completed: true},
                where = {id : savedOrder.id}
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(orders, {depth: null});
        expect(orders[0].completed).toBe(true);

        const moreOrders = await orderDAO.find(
            where = {customerId: customerUser.id }
        )
        expect(moreOrders[0].completed).toBe(false);
        expect(moreOrders[1].completed).toBe(true);

    });

});

describe('find', () => {

    it('when finding by customerId, will succeed', async() => {

        const product = await productDAO.insert({
            name: 'Product 1',
            description: 'Description 1',
        });

        const stock = await stockDAO.insert({
            productId: product.id,
            personnelId: personnelUser.id,
            supplier: 'Test Supplier',
            quantity: 10,
            unitPrice: 120,
            sellingPrice: 150,
        });


        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
        ]
        
        let index = 0;
        for (const data of orderData) {
            const o = await orderDAO.insertOrder(data);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )

                await orderDAO.insertOrderProduct(
                    {
                        orderId: o.id, 
                        serviceId: services[0].id,
                        productId: product.id, 
                        stockId: stock.id, 
                        price: 120, 
                        quantity: 2,
                    }
                )
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }

        let orders;
        let err = null;
        try {
            orders = await orderDAO.find( 
                where= {
                    customerId: customerUser.id,
                },
                opt= {
                    limit: 20,
                    skip: 0,
                } 
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(orders, {depth: null});

        expect(orders.length).toBe(2);

    });

    it('when finding by customerId with mechanic, will succeed', async() => {


        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
        ]
        
        let index = 0;
        for (const data of orderData) {
            const o = await orderDAO.insertOrder(data);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )


                await orderDAO.insertOrderMechanic(
                    {
                        orderId: o.id,
                        mechanicId: mechanic.id
                    }
                )
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }

        let orders;
        let err = null;
        try {
            orders = await orderDAO.find( 
                where= {
                    customerId: customerUser.id,
                },
                opt= {
                    limit: 20,
                    skip: 0,
                } 
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(orders, {depth: null});

        expect(orders.length).toBe(2);

    });

    it('when finding using opt.startDate and opt.endDate, will succeed', async() => {

        /// create a first one (excluded)
        const tmp0 = await orderDAO.insertOrder({
            customerId: customerUser.id,
            carMake: 'Toyota',
            carType: 'Camry',
            carYear: '2010',
            carPlate: '3333-ABCD',
            carOdometer: '9200',
            total: 9000,
        });

        // console.log(tmp0.createdAt);
        await new Promise(resolve => setTimeout(resolve, 333));
        const preDate = new Date();

        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 7000,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 8000,
            },
        ]
        
        // console.log(`preDate: ${preDate.toISOString()}`)
        let index = 0;
        for (const data of orderData) {
            const o = await orderDAO.insertOrder(data);
            // console.log(o.createdAt);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }
        await new Promise(resolve => setTimeout(resolve, 333));
        const postDate = new Date();

        let orders;
        let err = null;
        // console.log(`postDate: ${postDate.toISOString()}`)
        try {
            orders = await orderDAO.find( 
                where= {
                    // customerId: customerUser.id,
                },
                opt= {
                    startDate: preDate.toISOString(),
                    endDate: postDate.toISOString(),
                } 
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(orders, {depth: null});

        expect(orders.length).toBe(orderData.length);

    });

});


describe('total', () => {

    it('when finding total by customerId, will succeed', async() => {

        const preDate = new Date();
        await new Promise(resolve => setTimeout(() => resolve(), 333));
        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 300,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
        ]
    

        let index = 0;
        for (const data of orderData) {
            const o = await orderDAO.insertOrder(data);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }

        await new Promise(resolve => setTimeout(() => resolve(), 333));
        const postDate = new Date();
        let ordersTotal;
        let err = null;
        try {
            ordersTotal = await orderDAO.total( 
                where= {
                    customerId: customerUser.id,
                },
                opt= {
                    startDate: preDate.toISOString(),
                    endDate: postDate.toISOString(),
                } 
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(orders, {depth: null});

        expect(ordersTotal).toBe((orderData[0].total + orderData[1].total).toString());

    });


});


describe('findMechanicsWithOngoing', () => {

    it('when finding findMechanicsWithOngoing , will succeed', async() => {

        const preDate = new Date();
        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,

            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '4444-ABCD',
                carOdometer: '6700',
                total: 300,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '3212-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
        ]
        
        let index = 0;
        for (const oData of orderData) {
            const o = await orderDAO.insertOrder(oData);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )

                // insert mechanic
                await orderDAO.insertOrderMechanic(
                    data = {
                        orderId: o.id,
                        mechanicId: mechanic.id,
                    }
                );

                if (index == 0) {
                    await orderDAO.updateOrder(
                        data = {
                            completed: true
                        },
                        where = {
                            id: o.id
                        }
                    )
                }
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }

        const test = await orderDAO.find(where={});
        // console.dir(test, {depth: null});

        let mechanics;
        let err = null;
        try {
            mechanics = await orderDAO.findMechanicsWithOngoing();

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(mechanics, {depth: null});

        // expect(ordersTotal).toBe((orderData[0].total + orderData[1].total).toString());

    });


});



describe('findByMechanic', () => {

    it('when finding by mechanic id , will succeed', async() => {

        const preDate = new Date();
        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,

            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '4444-ABCD',
                carOdometer: '6700',
                total: 300,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '3212-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
        ]
        
        let index = 0;
        for (const oData of orderData) {
            const o = await orderDAO.insertOrder(oData);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )

                // insert mechanic
                await orderDAO.insertOrderMechanic(
                    data = {
                        orderId: o.id,
                        mechanicId: mechanic.id,
                    }
                );

       
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }


        let mechanics;
        let err = null;
        try {
            mechanics = await orderDAO.findByMechanic(
                where= {mechanicId: mechanic.id}
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(mechanics, {depth: null});

        expect(mechanics.length).toBe(2);

        // expect(ordersTotal).toBe((orderData[0].total + orderData[1].total).toString());

    });

});



describe('findCountByMechanic', () => {

    it('when finding count by mechanic id , will succeed', async() => {

        const preDate = new Date();
        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Camry',
                carYear: '2000',
                carPlate: '1234-ABCD',
                carOdometer: '6700',
                total: 6000,

            },
            {
                customerId: customerUser.id,
                carMake: 'Toyota',
                carType: '2020 Wigo',
                carYear: 'Black',
                carPlate: '4444-ABCD',
                carOdometer: '6700',
                total: 300,
            },
            {
                customerId: personnelUser.id,
                carMake: 'Honda',
                carType: '2020 Civi',
                carYear: 'White',
                carPlate: '3212-ABCD',
                carOdometer: '6700',
                total: 6000,
            },
        ]
        
        let index = 0;
        for (const oData of orderData) {
            const o = await orderDAO.insertOrder(oData);

            if (index == 0 || index == 2) {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )

                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id
                    }
                )

                // insert mechanic
                await orderDAO.insertOrderMechanic(
                    data = {
                        orderId: o.id,
                        mechanicId: mechanic.id,
                    }
                );

       
            } else {
                await orderDAO.insertOrderService(
                    {
                        orderId: o.id,
                        serviceId: services[0].id,
                        price: services[1].price
                    }
                )
            }
            index++;
            // console.log(index);
        }


        let mechanics;
        let err = null;
        try {
            mechanics = await orderDAO.findCountByMechanic(
                where= {mechanicId: mechanic.id}
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        // console.dir(mechanics, {depth: null});


        expect(parseInt(mechanics)).toBe(2);

        // expect(ordersTotal).toBe((orderData[0].total + orderData[1].total).toString());

    });

});