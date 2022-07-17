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
const OrderMechanic = require('../../order/orderMechanics.model');
const Stock = require('../../stock/stock.model');

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


let managerUser, personnelUser, customerUser;
let managerToken, personnelToken, customerToken;

const mechanics = [];
let services = [];
let products = [];


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


    for (const mechanic of [
        {
            mobile: '639359372676',
            firstName: 'John Robin',
            lastName: 'Perez',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Male',
        },
        {
            mobile: '639359372677',
            firstName: 'Test 1',
            lastName: 'Perez',
            birthDay: new Date(Date.now()).toISOString(),
            gender: 'Female',
        }
    ]) {
        const c = await mechanicDAO.insert(mechanic)
        mechanics.push(c);
    }
});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Order.tableName};`);
    await pool.query(`DELETE FROM ${OrderServices.tableName};`);
    await pool.query(`DELETE FROM ${OrderProducts.tableName};`);
    await pool.query(`DELETE FROM ${OrderPayments.tableName};`);
    await pool.query(`DELETE FROM ${OrderMechanic.tableName};`);
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Service.tableName};`);
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
        services: [
            {
                id: services[0].id,
                price: services[0].price,
                addedProducts: [{
                    id: products[0].id,
                    addedStocks: [
                        {
                            id: products[0].stocks[0].id,
                            quantity: 2,
                            price: products[0].stocks[0].sellingPrice,
                        },
                        {
                            id: products[0].stocks[1].id,
                            quantity: 1,
                            price: products[0].stocks[1].sellingPrice,
                        },
                        {
                            id: products[1].stocks[1].id,
                            quantity: 5,
                            price: products[1].stocks[1].sellingPrice,
                        },
                    ],
                },
                {
                    id: products[1].id,
                    addedStocks: [
                        {
                            id: products[1].stocks[0].id,
                            quantity: 1,
                            price: products[1].stocks[0].sellingPrice,
                        },
                        {
                            id: products[2].stocks[0].id,
                            quantity: 3,
                            price: products[2].stocks[0].sellingPrice,
                        },
                    ],
                }]
            }
        ],
        mechanics: [...mechanics],
        payment: {
            type: 'Cash',
            amount: 750
        },
        discount: 50, 
    };

    const createOrderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);
    // console.dir(createOrderResponse.body, { depth: null });
    expect(createOrderResponse.status).toBe(200);
    expect(createOrderResponse.body.data).not.toBeNull();
    const o = createOrderResponse.body.data;

    const orderDetails = await orderDAO.find(where = {id: o.id});
    const stocks = await stockDAO.find(where = {});
    // console.dir(stocks, {depth: null});
    stocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(98);
        } else if (ss.id == products[0].stocks[1].id) {
            expect(parseInt(ss.quantity)).toBe(9);
        } else if (ss.id == products[1].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(199);
        } else if (ss.id == products[1].stocks[1].id) {
            expect(parseInt(ss.quantity)).toBe(15);
        } else if (ss.id == products[2].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(297);
        }
    });

    
    const getEditResponse = await request(app)
        .get(`/${v}/orders/${o.id}/edit`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();
    // console.dir(getEditResponse.body, { depth: null });
    expect(getEditResponse.status).toBe(200);
    expect(getEditResponse.body.data).not.toBeNull();


    const editData = getEditResponse.body.data;
    editData.services = [...editData.orderServices];
    editData.mechanics = [...editData.orderMechanics];
    delete editData.orderMechanics;
    delete editData.orderServices;
    // // increasing quantity to fail
    editData.services[0].addedProducts[0].addedStocks[0].quantity = 3;
    editData.carMake = 'Edited Car Make';
    editData.carType = 'Edited Car Type';
    editData.carPlate = 'Edited Car Plate';
    editData.carYear = 'Edited Car Year';

    // console.dir(editData, { depth: null });

    const response = await request(app)
        .post(`/${v}/orders/${o.id}/update`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(editData);
    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.carMake).toBe(editData.carMake);
    expect(response.body.data.carType).toBe(editData.carType);
    expect(response.body.data.carYear).toBe(editData.carYear);
    expect(response.body.data.carPlate).toBe(editData.carPlate);


    const newOrderDetails = await orderDAO.find(where = {id: o.id});
    const newStocks = await stockDAO.find(where = {});
    // console.dir(newStocks, {depth: null});
    newStocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(98);
        } else if (ss.id == products[0].stocks[1].id) {
            expect(parseInt(ss.quantity)).toBe(7);
        } else if (ss.id == products[1].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(199);
        } else if (ss.id == products[1].stocks[1].id) {
            expect(parseInt(ss.quantity)).toBe(15);
        } else if (ss.id == products[2].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(297);
        }
    });

});

it('when editing with new product, will succeed', async() => {

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
        services: [
            {
                id: services[0].id,
                price: services[0].price,
                addedProducts: [{
                    id: products[0].id,
                    addedStocks: [
                        {
                            id: products[0].stocks[0].id,
                            quantity: 2,
                            price: products[0].stocks[0].sellingPrice,
                        },
                    ],
                }]
            }
        ],
        mechanics: [...mechanics],
        payment: {
            type: 'Cash',
            amount: 50
        },
        discount: 50, 
    };

    const createOrderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);
    // console.dir(createOrderResponse.body, { depth: null });
    expect(createOrderResponse.status).toBe(200);
    expect(createOrderResponse.body.data).not.toBeNull();
    const o = createOrderResponse.body.data;

    const orderDetails = await orderDAO.find(where = {id: o.id});
    const stocks = await stockDAO.find(where = {});
    // console.dir(stocks, {depth: null});
    stocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(98);
        }
    });

    
    const getEditResponse = await request(app)
        .get(`/${v}/orders/${o.id}/edit`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();
    // console.dir(getEditResponse.body, { depth: null });
    expect(getEditResponse.status).toBe(200);
    expect(getEditResponse.body.data).not.toBeNull();


    const editData = getEditResponse.body.data;
    editData.services = [...editData.orderServices];
    editData.mechanics = [...editData.orderMechanics];
    delete editData.orderMechanics;
    delete editData.orderServices;
    // // increasing quantity to fail

    editData.services[0].addedProducts[0].addedStocks.push({
        id: products[0].stocks[1].id,
        quantity: 5,
        price: products[0].stocks[1].sellingPrice,
    });
    editData.services[0].addedProducts.push({
        id: products[1].id,
        addedStocks: [
            {
                id: products[1].stocks[0].id,
                quantity: 1,
                price: products[1].stocks[0].sellingPrice,
            },
            {
                id: products[2].stocks[0].id,
                quantity: 3,
                price: products[2].stocks[0].sellingPrice,
            },
        ],
    });
    editData.carMake = 'Edited Car Make';
    editData.carType = 'Edited Car Type';
    editData.carPlate = 'Edited Car Plate';
    editData.carYear = 'Edited Car Year';

    // console.dir(editData, { depth: null });

    const response = await request(app)
        .post(`/${v}/orders/${o.id}/update`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(editData);
    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.carMake).toBe(editData.carMake);
    expect(response.body.data.carType).toBe(editData.carType);
    expect(response.body.data.carYear).toBe(editData.carYear);
    expect(response.body.data.carPlate).toBe(editData.carPlate);


    const newOrderDetails = await orderDAO.find(where = {id: o.id});
    const newStocks = await stockDAO.find(where = {});
    // console.dir(newStocks, {depth: null});
    newStocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(98);
        } else if (ss.id == products[0].stocks[1].id) {
            expect(parseInt(ss.quantity)).toBe(5);
        } else if (ss.id == products[1].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(199);
        } else if (ss.id == products[2].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(297);
        }
    });

});


it('when editing stock quantity, will succeed', async() => {

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
        services: [
            {
                id: services[0].id,
                price: services[0].price,
                addedProducts: [{
                    id: products[0].id,
                    addedStocks: [
                        {
                            id: products[0].stocks[0].id,
                            quantity: 70,
                            price: products[0].stocks[0].sellingPrice,
                        },
                    ],
                }]
            }
        ],
        mechanics: [...mechanics],
        payment: {
            type: 'Cash',
            amount: 50
        },
        discount: 50, 
    };

    const createOrderResponse = await request(app)
        .post(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(orderData);
    // console.dir(createOrderResponse.body, { depth: null });
    expect(createOrderResponse.status).toBe(200);
    expect(createOrderResponse.body.data).not.toBeNull();
    const o = createOrderResponse.body.data;

    const orderDetails = await orderDAO.find(where = {id: o.id});
    const stocks = await stockDAO.find(where = {});
    // console.dir(stocks, {depth: null});
    stocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(30);
        }
    });

    
    const getEditResponse = await request(app)
        .get(`/${v}/orders/${o.id}/edit`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();
    // console.dir(getEditResponse.body, { depth: null });
    expect(getEditResponse.status).toBe(200);
    expect(getEditResponse.body.data).not.toBeNull();


    const editData = getEditResponse.body.data;
    editData.services = [...editData.orderServices];
    editData.mechanics = [...editData.orderMechanics];
    delete editData.orderMechanics;
    delete editData.orderServices;
    // // increasing quantity to fail

    editData.services[0].addedProducts[0].addedStocks[0].quantity = 50;
    editData.carMake = 'Edited Car Make';
    editData.carType = 'Edited Car Type';
    editData.carPlate = 'Edited Car Plate';
    editData.carYear = 'Edited Car Year';

    // console.dir(editData, { depth: null });

    const response = await request(app)
        .post(`/${v}/orders/${o.id}/update`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(editData);
    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.carMake).toBe(editData.carMake);
    expect(response.body.data.carType).toBe(editData.carType);
    expect(response.body.data.carYear).toBe(editData.carYear);
    expect(response.body.data.carPlate).toBe(editData.carPlate);


    const newOrderDetails = await orderDAO.find(where = {id: o.id});
    const newStocks = await stockDAO.find(where = {});
    // console.dir(newStocks, {depth: null});
    newStocks.forEach(ss => {
        if (ss.id == products[0].stocks[0].id) {
            expect(parseInt(ss.quantity)).toBe(50);
        }
    });

});