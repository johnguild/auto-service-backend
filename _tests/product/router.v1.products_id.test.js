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
let personnelId;


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

    personnelId = personnel.id;
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

    /// create service
    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }
    const service = await productDAO.insert(productData);

    // console.log(personnel);

    const newData = {
        name: 'Product 2',
        description: 'Description 3',
    }

    const response = await request(app)
        .post(`/${v}/products/${service.id}`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.name).toBe(newData.name);
    expect(response.body.data.description).toBe(newData.description);
});

it('when with non existing product id data, will fail', async() => {


    const newData = {
        name: 'Product 2',
        description: 'Description 3',
    }

    /// use personnel id instead
    const response = await request(app)
        .post(`/${v}/products/${personnelId}`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});

it('when with invalid uuid data, will fail', async() => {

    const newData = {
        name: 'Product 2',
        description: 'Description 3',
    }

    const response = await request(app)
        .post(`/${v}/products/notauuid`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});