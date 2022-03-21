const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const serviceMigration0 = require('../../db_migrations/1641136498591_create_services_table');
const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const stockMigration0 = require('../../db_migrations/1641300048254_create_stocks_table');
const mechanicMigration0 = require('../../db_migrations/1644727593949_create_mechanics_table');
const orderMigration0 = require('../../db_migrations/1642765556944_create_orders_table');
const orderServicesMigration0 = require('../../db_migrations/1642766434532_create_order_services_table');
const orderProductsMigration0 = require('../../db_migrations/1642766700669_create_order_products_table');
const orderPaymentsMigration0 = require('../../db_migrations/1642766906031_create_order_payments_table');
const orderMechanicsMigration0 = require('../../db_migrations/1647022126173_create_order_mechanics_table');

const User = require('../../user/user.model');
const Service = require('../../service/service.model');
const Product = require('../../product/product.model');
const Stock = require('../../stock/stock.model');
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
const stockDAO = require('../../stock/stock.dao');
const mechanicDAO = require('../../mechanic/mechanic.dao');

const { app } = require('../../app');
const v = 'v1';

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


let managerUser, personnelUser, customerUser;
let managerToken, personnelToken, customerToken;
let mechanic;

const services = [];
const products = [];


beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await serviceMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
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
    await stockMigration0.up();
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
    managerToken = tokenator.generate({ userId: managerUser.id });


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnelUser = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });  
    personnelToken = tokenator.generate({ userId: personnelUser.id });


    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    customerUser = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  
    customerToken = tokenator.generate({ userId: customerUser.id });


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
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);
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
    await stockMigration0.down();
    await mechanicMigration0.down();
    await orderMigration0.down();
    await orderServicesMigration0.down();
    await orderProductsMigration0.down();
    await orderPaymentsMigration0.down();
    await orderMechanicsMigration0.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    /// create products and stocks
    for (const product of [
        {
            name: 'Product 1',
            sku: '123456',
            description: 'Description 1',
        },
        {
            name: 'Product 2',
            sku: '0003123123',
            description: 'Description 2',
        },
        {
            name: 'Product 3',
            sku: '000414444',
            description: 'Description 3',
        },
    ]) {
        const productInstance = await productDAO.insert(product);
        products.push(productInstance);

        await stockDAO.insert({
            productId: productInstance.id,
            personnelId: personnelUser.id,
            supplier: 'Texas',
            quantity: 720,
            unitPrice: 99,
            sellingPrice: 131,
        });

        await stockDAO.insert({
            productId: productInstance.id,
            personnelId: personnelUser.id,
            supplier: 'Texas',
            quantity: 400,
            unitPrice: 89,
            sellingPrice: 132,
        });
    }

    /// create services first
    const orderData = {
        customerId: customerUser.id,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
        services: [{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                price: 300,
                quantity: 1,
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                price: 400,
                quantity: 2,
            }]
        }],
        payment: {
            type: 'Cash',
            amount: 750
        }
    }

    const response = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

    const orderDetails = await orderDAO.find(where = {customerId: customerUser.id});
    // console.dir(orderDetails, {depth: null});

    const stocks = await stockDAO.find(where = {});
    // console.dir(stocks, {depth: null});


});



it('when with there are no services, will succeed', async() => {


    // create services first
    const orderData = {
        customerId: customerUser.id,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
        payment: {
            type: 'Cash',
            amount: 750
        }
    }

    const response = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});



it('when with there are no products in services, will succeed', async() => {

    // create services first
    const orderData = {
        customerId: customerUser.id,
        installments: 3,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        workingDays: 10,
        downPayment: 1000,
        services: [{
            id: services[0].id,
            price: services[0].price,
        },{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                price: products[1].price,
                quantity: 1,
            }]
        }],
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
        payment: {
            type: 'Cash',
            amount: 750
        }
    }

    const response = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

