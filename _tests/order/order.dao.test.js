const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const serviceMigration0 = require('../../db_migrations/1641136498591_create_services_table');
const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const orderMigration0 = require('../../db_migrations/1642765556944_create_orders_table');
const orderServicesMigration0 = require('../../db_migrations/1642766434532_create_order_services_table');
const orderProductsMigration0 = require('../../db_migrations/1642766700669_create_order_products_table');
const orderPaymentsMigration0 = require('../../db_migrations/1642766906031_create_order_payments_table');

const User = require('../../user/user.model');
const Service = require('../../service/service.model');
const Product = require('../../product/product.model');
const Order = require('../../order/order.model');
const OrderServices = require('../../order/orderServices.model');
const OrderProducts = require('../../order/orderProducts.model');
const OrderPayments = require('../../order/orderPayments.model');

const userDAO = require('../../user/user.dao');
const orderDAO = require('../../order/order.dao');
const serviceDAO = require('../../service/service.dao');
const productDAO = require('../../product/product.dao');

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


let managerUser, personnelUser, customerUser;

const services = [];


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await serviceMigration0.down();
    await productMigration0.down();
    await orderMigration0.down();
    await orderServicesMigration0.down();
    await orderProductsMigration0.down();
    await orderPaymentsMigration0.down();
    // clear db
    await userMigration0.up();
    await serviceMigration0.up();
    await productMigration0.up();
    await orderMigration0.up();
    await orderServicesMigration0.up();
    await orderProductsMigration0.up();
    await orderPaymentsMigration0.up();


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
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Order.tableName};`);
    await pool.query(`DELETE FROM ${OrderServices.tableName};`);
    await pool.query(`DELETE FROM ${OrderProducts.tableName};`);
    await pool.query(`DELETE FROM ${OrderPayments.tableName};`);
});

afterAll( async() => {
    await userMigration0.down();
    await serviceMigration0.down();
    await productMigration0.down();
    await orderMigration0.down();
    await orderServicesMigration0.down();
    await orderProductsMigration0.down();
    await orderPaymentsMigration0.down();
    await closePool();
});


describe('insertOrder', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const orderData = {
            customerId: customerUser.id,
            total: 1200,
            installments: 3,
            carBrand: 'Toyota',
            carModel: '2020 Camry',
            carColor: 'Silver',
            carPlate: '1234-ABCD'
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
        expect(parseFloat(order.total)).toBe(orderData.total)
        expect(parseFloat(order.installments)).toBe(orderData.installments)
    });

});

describe('insertOrderServices', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            installments: 3,
            carBrand: 'Toyota',
            carModel: '2020 Camry',
            carColor: 'Silver',
            carPlate: '1234-ABCD'
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
            installments: 3,
            carBrand: 'Toyota',
            carModel: '2020 Camry',
            carColor: 'Silver',
            carPlate: '1234-ABCD'
        });

        const product = await productDAO.insert({
            name: 'Product 1',
            sku: '123456',
            description: 'Description 1',
            stock: 12,
            price: 100.5,
        });


        let orderProduct;
        let err = null;
        try {
            orderProduct = await orderDAO.insertOrderProduct(
                data = {
                    orderId: order.id, 
                    productId: product.id, 
                    price: product.price, 
                }
            );

        } catch (error) {
            err = error;
        }
        expect(err).toBeNull();

        expect(orderProduct.orderId).toBe(order.id);
        expect(orderProduct.productId).toBe(product.id)
        expect(orderProduct.price).toBe(product.price)
    });

});

describe('insertOrderPayments', () => {

    it('when creating with valid and complete data, will succeed', async() => {

        const order = await orderDAO.insertOrder({
            customerId: customerUser.id,
            total: 1200,
            installments: 3,
            carBrand: 'Toyota',
            carModel: '2020 Camry',
            carColor: 'Silver',
            carPlate: '1234-ABCD'
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



describe('find', () => {

    it('when finding by customerId, will succeed', async() => {


        /// create products first
        const orderData = [
            {
                customerId: customerUser.id,
                installments: 3,
                carBrand: 'Toyota',
                carModel: '2020 Camry',
                carColor: 'Silver',
                carPlate: '1234-ABCD',
                total: 6000,
            },
            {
                customerId: customerUser.id,
                installments: 5,
                carBrand: 'Toyota',
                carModel: '2020 Wigo',
                carColor: 'Black',
                carPlate: '1234-ABCD',
                total: 6000,
            },
            {
                customerId: personnelUser.id,
                installments: 5,
                carBrand: 'Honda',
                carModel: '2020 Civi',
                carColor: 'White',
                carPlate: '1234-ABCD',
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

    // it('when finding all with limit, will succeed', async() => {

    //     /// create products first
    //     const productData = [
    //         {
    //             name: 'Product 1',
    //             sku: '123456',
    //             description: 'Description 1',
    //             stock: 12,
    //             price: 100.5,
    //         },
    //         {
    //             name: 'Product 2',
    //             sku: '0003123123',
    //             description: 'Description 2',
    //             stock: 12,
    //             price: 100.5,
    //         },
    //         {
    //             name: 'Product 3',
    //             sku: '000414444',
    //             description: 'Description 3',
    //             stock: 120,
    //             price: 2000,
    //         },
    //     ]

    //     for (const data of productData) {
    //         const c = await productDAO.insert(data);
    //         // console.log(c);
    //     }

      
    //     let err = null;
    //     try {
    //         const searchRes = await productDAO.find( 
    //             where= {},
    //             options= {limit: 2}
    //         );

    //         expect(searchRes.length).toBe(2);

    //         // console.log(searchRes);
    //     } catch (error) {
    //         err = error;
    //     }
    //     expect(err).toBeNull();

    // });

    // it('when finding all with skip, will succeed', async() => {

    //     /// create products first
    //     const productData = [
    //         {
    //             name: 'Product 1',
    //             sku: '123456',
    //             description: 'Description 1',
    //             stock: 12,
    //             price: 100.5,
    //         },
    //         {
    //             name: 'Product 2',
    //             sku: '0003123123',
    //             description: 'Description 2',
    //             stock: 12,
    //             price: 100.5,
    //         },
    //         {
    //             name: 'Product 3',
    //             sku: '000414444',
    //             description: 'Description 3',
    //             stock: 120,
    //             price: 2000,
    //         },
    //     ]

    //     for (const data of productData) {
    //         const c = await productDAO.insert(data);
    //         // console.log(c);
    //     }

      
    //     let err = null;
    //     try {
    //         const searchRes = await productDAO.find( 
    //             where= {},
    //             options= {skip: 2}
    //         );

    //         expect(searchRes.length).toBe(1);

    //         // console.log(searchRes);
    //     } catch (error) {
    //         err = error;
    //     }
    //     expect(err).toBeNull();

    // });

    // it('when finding all with limit and skip, will succeed', async() => {

    //     /// create products first
    //     const productData = [
    //         {
    //             name: 'Product 1',
    //             sku: '123456',
    //             description: 'Description 1',
    //             stock: 12,
    //             price: 100.5,
    //         },
    //         {
    //             name: 'Product 2',
    //             sku: '0003123123',
    //             description: 'Description 2',
    //             stock: 12,
    //             price: 100.5,
    //         },
    //         {
    //             name: 'Product 3',
    //             sku: '000414444',
    //             description: 'Description 3',
    //             stock: 120,
    //             price: 2000,
    //         },
    //     ]

    //     for (const data of productData) {
    //         const c = await productDAO.insert(data);
    //         // console.log(c);
    //     }

      
    //     let err = null;
    //     try {
    //         const searchRes = await productDAO.find( 
    //             where= {},
    //             options= {limit: 1, skip: 1}
    //         );

    //         expect(searchRes.length).toBe(1);

    //         // console.log(searchRes);
    //     } catch (error) {
    //         err = error;
    //     }
    //     expect(err).toBeNull();

    // });
});
