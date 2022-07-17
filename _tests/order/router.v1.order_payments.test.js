const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');


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
const req = require('express/lib/request');
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
    await migrate.down();
    // clear db
    await migrate.up();


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
    
    /// create products and stocks
    for (const product of [
        {
            name: 'Product 1',
            description: 'Description 1',
        },
        {
            name: 'Product 2',
            description: 'Description 2',
        },
        {
            name: 'Product 3',
            description: 'Description 3',
        },
    ]) {
        const productInstance = await productDAO.insert(product);

        const stock1 = await stockDAO.insert({
            productId: productInstance.id,
            personnelId: personnelUser.id,
            supplier: 'Texas',
            quantity: 720,
            unitPrice: 99,
            sellingPrice: 131,
        });

        const stock2 = await stockDAO.insert({
            productId: productInstance.id,
            personnelId: personnelUser.id,
            supplier: 'Texas',
            quantity: 400,
            unitPrice: 89,
            sellingPrice: 132,
        });

        productInstance.stocks = [stock1, stock2];
        products.push(productInstance);
    }


    // create mechanic
    mechanic = await mechanicDAO.insert(mechanicData);
});

beforeEach( async() => {
    // await pool.query(`DELETE FROM ${Product.tableName};`);
    // await pool.query(`DELETE FROM ${Stock.tableName};`);
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


it('when with valid data with Cash, will succeed', async() => {


    // create order first
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
                stocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 1,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                stocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 2,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        }],
        payment: {
            type: 'AccountsReceivable',
            amount: 300
        },
        discount: 100.5,
    }

    const orderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(orderResponse.body, { depth: null });

    const paymentResponse = await request(app)
        .post(`/${v}/orders/${orderResponse.body.data.id}/payments`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            type: 'Cash',
            amount: 12000,
        });

    // console.dir(paymentResponse.body, { depth: null });

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.data).not.toBeNull();

});


it('when with valid data with Online, will succeed', async() => {


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
        services: [{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                stocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 1,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                stocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 2,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        }],
        payment: {
            type: 'AccountsReceivable',
            amount: 300
        },
        discount: 100.5,
    }

    const orderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(orderResponse.body, { depth: null });

    const paymentData = {
        type: 'Online',
        bank: 'BDO',
        referenceNumber: 'BDO09090',
        amount: 12000,
    
    }

    const paymentResponse = await request(app)
        .post(`/${v}/orders/${orderResponse.body.data.id}/payments`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(paymentData);

    // console.dir(paymentResponse.body, { depth: null });

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.data).not.toBeNull();

});

it('when with valid data with Cheque, will succeed', async() => {


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
        services: [{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                stocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 1,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            products: [{
                id: products[0].id,
                stocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 2,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        }],
        payment: {
            type: 'Cheque',
            accountName: 'TestName',
            accountNumber: '0981276123',
            chequeNumber: '000123123',
            amount: 300
        }, 
        discount: 100.5,
    }

    const orderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(orderResponse.body, { depth: null });

    const paymentData = {
        type: 'Cheque',
        accountName: 'TestName',
        accountNumber: '88989898',
        chequeNumber: '00333123123',
        amount: 12000,
    }

    const paymentResponse = await request(app)
        .post(`/${v}/orders/${orderResponse.body.data.id}/payments`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(paymentData);

    // console.dir(paymentResponse.body, { depth: null });

    expect(paymentResponse.status).toBe(200);
    expect(paymentResponse.body.data).not.toBeNull();

});

