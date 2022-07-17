const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const User = require('../../user/user.model');
const Service = require('../../service/service.model');
const Product = require('../../product/product.model');
const Order = require('../../order/order.model');
const OrderServices = require('../../order/orderServices.model');
const OrderProducts = require('../../order/orderProducts.model');
const OrderPayments = require('../../order/orderPayments.model');
const Stock = require('../../stock/stock.model');

const userDAO = require('../../user/user.dao');
const orderDAO = require('../../order/order.dao');
const serviceDAO = require('../../service/service.dao');
const productDAO = require('../../product/product.dao');
const stockDAO = require('../../stock/stock.dao');



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


let managerUser, personnelUser, customerUser;
let managerToken, personnelToken, customerToken;

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
        // console.log(productInstance);

        //add stocks
        const stock = await stockDAO.insert(data = {
            productId: productInstance.id,
            personnelId: personnelUser.id,
            supplier: 'Test Supplier',
            quantity: 120,
            unitPrice: 400,
            sellingPrice: 450,
        });

        productInstance.stocks = [stock];
        products.push(productInstance);
    }

    // const p1 = await productDAO.find(where={id: products[0].id});
    // console.dir(p1, {depth: null});
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Order.tableName};`);
    await pool.query(`DELETE FROM ${OrderServices.tableName};`);
    await pool.query(`DELETE FROM ${OrderProducts.tableName};`);
    await pool.query(`DELETE FROM ${OrderPayments.tableName};`);
});

afterAll( async() => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {


    // create services first
    const orderData = {
        customerId: customerUser.id,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        services: [{
            id: services[0].id,
            price: services[0].price,
            addedProducts: [{
                id: products[0].id,
                stockId: products[0].stocks[0].id, 
                price: 250,
                quantity: 1,
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            addedProducts: [{
                id: products[0].id,
                stockId: products[0].stocks[0].id, 
                price: 250,
                quantity: 2,
            }]
        }],
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
        payment: {
            type: 'Cash',
            amount: 750
        },
        discount: 50, 
    }
    // console.dir(orderData, { depth: null });

    const orderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(orderResponse.body, { depth: null });

    const newServices =  [{
        id: services[1].id,
        price: services[1].price,
        addedProducts: [{
            id: products[0].id,
            stockId: products[0].stocks[0].id, 
            price: 300,
            quantity: 2,
        }]
    },{
        id: services[2].id,
        price: services[2].price,
        addedProducts: [{
            id: products[0].id,
            stockId: products[0].stocks[0].id, 
            price: 300,
            quantity: 3,
        }]
    }]

    const serviceResponse = await request(app)
        .post(`/${v}/orders/${orderResponse.body.data.id}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            services: newServices,
        });

    // console.dir(serviceResponse.body, { depth: null });

    expect(serviceResponse.status).toBe(200);
    expect(serviceResponse.body.data).not.toBeNull();

    // const savedOrder = await orderDAO.find(
    //     where = {
    //         customerId: customerUser.id,
    //     }
    // )

    // console.dir(savedOrder, { depth: null });

});

