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

let services = [], products = [];


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
    await pool.query(`DELETE FROM ${Service.tableName};`);
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);


    services = [];
    products = [];
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

      
    /// crate products and stocks
    for (const product of [
        {
            name: 'Product 1',
            description: 'Description 1',
            carType: 'Car Type',
            carMake: 'Car Make',
            carYear: 'Car Year',
            carPart: 'Car Part',
        },
        {
            name: 'Product 2',
            description: 'Description 2',
            carType: 'Car Type 02',
            carMake: 'Car Make 02',
            carYear: 'Car Year 02',
            carPart: 'Car Part 02',
        },
        {
            name: 'Product 3',
            description: 'Description 3',
            carType: 'Car Type 03',
            carMake: 'Car Make 03',
            carYear: 'Car Year 03',
            carPart: 'Car Part 03',
        },
    ]) {
        const productInstance = await productDAO.insert(product);

        let stock1Qty = 100;
        let stock2Qty = 10;

        if (product.name == 'Product 2') {
            stock1Qty = 200;
            stock2Qty = 20;
        } else  if (product.name == 'Product 3') {
            stock1Qty = 300;
            stock2Qty = 30;
        }
 
        const stock = await stockDAO.insert(
            {
                productId: productInstance.id,
                personnelId: personnelUser.id,
                supplier: 'Test Supplier',
                quantity: stock1Qty,
                unitPrice: 120.5,
                sellingPrice: 155.5,
            }
        )

        const stock2 = await stockDAO.insert(
            {
                productId: productInstance.id,
                personnelId: personnelUser.id,
                supplier: 'Test Supplier 2',
                quantity: stock2Qty,
                unitPrice: 99,
                sellingPrice: 120,
            }
        )

        productInstance.stocks = [stock, stock2];
        products.push(productInstance);
    }

});

afterAll( async() => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

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
            addedProducts: [{
                id: products[0].id,
                addedStocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 2,
                },{
                    id: products[0].stocks[1].id,
                    price: products[0].stocks[1].sellingPrice,
                    quantity: 1,
                }]
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            addedProducts: [{
                id: products[0].id,
                addedStocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 1,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        },{
            id: services[1].id,
            price: services[1].price,
            addedProducts: [{
                id: products[0].id
            }]
        }],
        payment: {
            type: 'Cash',
            amount: 750
        },
        discount: 50, 
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
        },
        discount: 50 
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
            addedProducts: [{
                id: products[0].id,
                addedStocks: [{
                    id: products[0].stocks[0].id,
                    price: products[0].stocks[0].sellingPrice,
                    quantity: 1,
                    // quantity: products[0].stocks[0].quantity,
                }]
            }]
        }],
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
        payment: {
            type: 'Cash',
            amount: 50
        },
        discount: 50, 
    }

    const response = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

    const orderDetails = await orderDAO.find(where = {id: response.body.data.id});
    const stocks = await stockDAO.find(where = {});
    // console.dir(stocks, {depth: null});
    stocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(99);
        } 
    });

});

