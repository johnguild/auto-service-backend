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

const services = [];
const products = [];
const mechanics = [];


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

        const stock2 = await stockDAO.insert(
            {
                productId: productInstance.id,
                personnelId: personnelUser.id,
                supplier: 'Test Supplier 2',
                quantity: 80,
                unitPrice: 99,
                sellingPrice: 120,
            }
        )

        productInstance.stocks = [stock, stock2];
        products.push(productInstance);
    }

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
    };

    const o = await orderDAO.insertOrder(orderData);
    /// first service and products
    await orderDAO.insertOrderService(
        {
            orderId: o.id,
            serviceId: services[0].id,
            price: services[0].price
        }
    );

    await orderDAO.insertOrderProduct(
        {
            orderId: o.id,
            serviceId: services[0].id,
            productId: products[0].id,
            stockId: products[0].stocks[0].id, 
            price: 300,
            quantity: 2,
        }
    );

    await orderDAO.insertOrderProduct(
        {
            orderId: o.id,
            serviceId: services[0].id,
            productId: products[0].id,
            stockId: products[0].stocks[1].id, 
            price: 120,
            quantity: 1,
        }
    );

    await orderDAO.insertOrderProduct(
        {
            orderId: o.id,
            serviceId: services[0].id,
            productId: products[1].id,
            stockId: products[1].stocks[1].id, 
            price: 90,
            quantity: 3,
        }
    );

    await orderDAO.insertOrderProduct(
        {
            orderId: o.id,
            serviceId: services[0].id,
            productId: products[2].id,
            stockId: products[2].stocks[1].id, 
            price: 90,
            quantity: 1,
        }
    );
    
    /// second service and products
    await orderDAO.insertOrderService(
        {
            orderId: o.id,
            serviceId: services[1].id
        }
    );

    await orderDAO.insertOrderProduct(
        {
            orderId: o.id,
            serviceId: services[1].id,
            productId: products[1].id,
            stockId: products[1].stocks[0].id, 
            price: 100,
            quantity: 6,
        }
    );

    await orderDAO.insertOrderProduct(
        {
            orderId: o.id,
            serviceId: services[1].id,
            productId: products[2].id,
            stockId: products[2].stocks[0].id, 
            price: 300,
            quantity: 2,
        }
    );

    /// insert orderMechanic
    await orderDAO.insertOrderMechanic(
        data= {
            orderId: o.id,
            mechanicId: mechanics[0].id
        }
    )

    await orderDAO.insertOrderMechanic(
        data= {
            orderId: o.id,
            mechanicId: mechanics[1].id
        }
    )
    
    const response = await request(app)
        .get(`/${v}/orders/${o.id}/edit`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

