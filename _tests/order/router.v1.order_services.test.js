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
const addCompanyDetailsOnUserMigration0 = require('../../db_migrations/1647518448506_add_company_details_on_users_table');
const orderMigration1 = require('../../db_migrations/1650623506166_update_orders_add_discount');

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
    await addCompanyDetailsOnUserMigration0.up();
    await serviceMigration0.up();
    await productMigration0.up();
    await stockMigration0.up();
    await mechanicMigration0.up();
    await orderMigration0.up();
    await orderMigration1.up();
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
        products.push(productInstance);
        // console.log(productInstance);

        //add stocks
        await stockDAO.insert(data = {
            productId: productInstance.id,
            personnelId: personnelUser.id,
            supplier: 'Test Supplier',
            quantity: 120,
            unitPrice: 400,
            sellingPrice: 450,
        });
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
                price: 250,
                quantity: 1,
            }]
        },{
            id: services[0].id,
            price: services[0].price,
            addedProducts: [{
                id: products[0].id,
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
            price: 300,
            quantity: 2,
        }]
    },{
        id: services[2].id,
        price: services[2].price,
        addedProducts: [{
            id: products[0].id,
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

