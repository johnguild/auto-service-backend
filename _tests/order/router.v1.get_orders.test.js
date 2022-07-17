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

        const stock = await stockDAO.insert(
            {
                productId: productInstance.id,
                personnelId: personnelUser.id,
                supplier: 'Test Supplier',
                quantity: 120,
                unitPrice: 120.5,
                sellingPrice: 155.5,
            }
        )

        productInstance.stocks = [stock];
        products.push(productInstance);
    }
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
    const orderData = [{
        customerId: customerUser.id,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
    }, {
        customerId: customerUser.id,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
    }, {
        customerId: personnelUser.id,
        carMake: 'Toyota',
        carType: '2020 Camry',
        carYear: '2000',
        carPlate: '1234-ABCD',
        carOdometer: '6700',
        receiveDate: new Date().toISOString(),
        warrantyEnd: new Date().toISOString(),
    }]

   
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
            );

            await orderDAO.insertOrderService(
                {
                    orderId: o.id,
                    serviceId: services[0].id
                }
            );
            
            // add products
            await orderDAO.insertOrderProduct(
                {
                    orderId: o.id,
                    serviceId: services[0].id,
                    productId: products[0].id,
                    stockId: products[0].stocks[0].id, 
                    price: 300,
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

    const response = await request(app)
        .get(`/${v}/orders`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(3);

});

