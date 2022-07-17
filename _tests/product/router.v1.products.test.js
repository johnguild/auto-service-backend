const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();
const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const productDAO = require('../../product/product.dao');
const Product = require('../../product/product.model');
const ProductArchive = require('../../product/product_archive.model');

const Stock = require('../../stock/stock.model');
const stockDAO = require('../../stock/stock.dao');


const { app } = require('../../app');
const v = 'v1';

const personnelData = {
    email: 'johnrobin.autoproduct@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_PERSONNEL,
}

let personnelToken;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await migrate.down();
    // migrate tables
    await migrate.up();


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    const personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     
    
    personnelToken = tokenator.generate({ userId: personnel.id });
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);
    await pool.query(`DELETE FROM ${ProductArchive.tableName};`);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }

    const response = await request(app)
        .post(`/${v}/products`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(productData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with required only data, will succeed', async() => {

    const productData = {
        name: 'Name 1',
        description: 'Something here',
    }

    const response = await request(app)
        .post(`/${v}/products`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(productData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with carMake only, will succeed', async() => {

    /// Note: undefined is accepted, but not null
    const productData = {
        name: 'Name 1',
        description: 'Something here',
        carMake: 'Test',
        // carType: undefined,
        // carYear: undefined,
        // carPart: undefined,
    }

    const response = await request(app)
        .post(`/${v}/products`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(productData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with no description data, will fail', async() => {

    const productData = {
        name: 'Name',
        // description: 100.54,
    }


    const response = await request(app)
        .post(`/${v}/products`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(productData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autoproduct@gmail.com',
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
 

    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }

    const response = await request(app)
        .post(`/${v}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send(productData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
