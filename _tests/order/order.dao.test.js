const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const serviceMigration0 = require('../../db_migrations/1641136498591_create_services_table');
const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const mechanicMigration0 = require('../../db_migrations/1644727593949_create_mechanics_table');
const orderMigration0 = require('../../db_migrations/1642765556944_create_orders_table');
const orderServicesMigration0 = require('../../db_migrations/1642766434532_create_order_services_table');
const orderProductsMigration0 = require('../../db_migrations/1642766700669_create_order_products_table');
const orderPaymentsMigration0 = require('../../db_migrations/1642766906031_create_order_payments_table');
const orderMechanicsMigration0 = require('../../db_migrations/1647022126173_create_order_mechanics_table');

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
    await userMigration0.down();
    await serviceMigration0.down();
    await productMigration0.down();
    await mechanicMigration0.down();
    await orderMigration0.down();
    await orderServicesMigration0.down();
    await orderProductsMigration0.down();
    await orderPaymentsMigration0.down();
    await orderMechanicsMigration0.down();
    // clear db
    await userMigration0.up();
    await serviceMigration0.up();
    await productMigration0.up();
    await mechanicMigration0.up();
    await orderMigration0.up();
    await orderServicesMigration0.up();
    await orderProductsMigration0.up();
    await orderPaymentsMigration0.up();
    await orderMechanicsMigration0.up();


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
    await userMigration0.down();
    await serviceMigration0.down();
    await productMigration0.down();
    await mechanicMigration0.down();
    await orderMigration0.down();
    await orderServicesMigration0.down();
    await orderProductsMigration0.down();
    await orderPaymentsMigration0.down();
    await orderMechanicsMigration0.down();
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
            sku: '123456',
            description: 'Description 1',
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
        expect(orderProduct.price).toBe(productPrice.toString());
        expect(orderProduct.quantity).toBe(productQuantity.toString());
    });

});

describe('insertOrderPayments', () => {

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

        const paymentData = {
            orderId: order.id, 
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

});
