const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const serviceDAO = require('../../service/service.dao');
const Service = require('../../service/service.model');

const productDAO = require('../../product/product.dao');
const Product = require('../../product/product.model');

const Stock = require('../../stock/stock.model');

const { app } = require('../../app');
const v = 'v1';

const managerData = {
    email: 'johnrobin.autoservice@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_MANAGER,
}

let managerToken;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();

    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });
});

beforeEach( async () => {
    await pool.query(`
        DELETE FROM ${Product.tableName};
        DELETE FROM ${Stock.tableName};
        DELETE FROM ${Service.tableName};
    `);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data without products, will succeed', async() => {

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        cover: 'base64string',
        price: 100.2,
        discountedPrice: undefined,
        isPublic: true,
    }

    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with valid data with products, will succeed', async() => {

    const product1 = await productDAO.insert({
        name: 'test prod',
        description: 'desc',
    });

    const product2 = await productDAO.insert({
        name: 'test prod 2',
        description: 'desc',
    });

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        cover: 'base64string',
        price: 100.2,
        discountedPrice: undefined,
        isPublic: true,
        products: [
            product1.id,
            product2.id,
        ]
    }

    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with required only data, will succeed', async() => {

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        price: 120, 
    }

    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with invalid price data, will fail', async() => {

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        price: "123e"
    }


    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autoservice@gmail.com',
        password: 'P@ssW0rd',
        firstName: 'Muphy',
        lastName: 'Tayag',
        birthDay: new Date(Date.now()).toISOString(),
        gender: 'Female',
        role: User.ROLE_CUSTOMER,
    }
    const customerEncryptedPass = await bcrypt.hash(customerData.password, parseInt(process.env.BCRYPT_SALT));
    const customer = await userDAO.insert(data = {
        ...customerData,
        password: customerEncryptedPass,
    });  

    /// create token
    const token = tokenator.generate({ userId: customer.id });
 

    const serviceData = {
        title: 'Repair Service',
        description: 'Something here',
        cover: 'base64string',
        price: 100.2,
        discountedPrice: undefined,
        isPublic: true,
    }

    const response = await request(app)
        .post(`/${v}/services`)
        .set('Authorization', `Bearer ${token}`)
        .send(serviceData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
