const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const productDAO = require('../../product/product.dao');
const Product = require('../../product/product.model');

const stockMigration0 = require('../../db_migrations/1641300048254_create_stocks_table');
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

const productData = {
    name: 'Product 1',
    description: 'Description 1',
}

let personnelToken, personnel, product;

beforeAll( async() => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
    // migrate tables
    await userMigration0.up();
    await productMigration0.up();
    await stockMigration0.up();


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     
    personnelToken = tokenator.generate({ userId: personnel.id });

    product = await productDAO.insert(productData);

});

beforeEach( async() => {
    await pool.query(`DELETE FROM ${Stock.tableName};`);
});

afterAll( async() => {
    await userMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
    await closePool();
});



it('when with valid data, will succeed', async() => {

    /// create service
    const stockData = {
        productId: product.id,
        personnelId: personnel.id,
        supplier: 'Some Supplier',
        quantity: 120,
        unitPrice: 300.5,
        sellingPrice: 330,
    }
    const service = await stockDAO.insert(stockData);

    // console.log(personnel);

    const newData = {
        supplier: 'Test',
        quantity: 20,
        unitPrice: 100.5,
        sellingPrice: 130,
    }

    const response = await request(app)
        .post(`/${v}/stocks/${service.id}`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.supplier).toBe(newData.supplier);
    expect(response.body.data.quantity).toBe(newData.quantity.toString());
    expect(response.body.data.unitPrice).toBe(newData.unitPrice.toString());
    expect(response.body.data.sellingPrice).toBe(newData.sellingPrice.toString());

});

it('when with non existing stock id data, will fail', async() => {


    const newData = {
        supplier: 'Test',
        quantity: 20,
        unitPrice: 100.5,
        sellingPrice: 130,
    }

    /// use personnel id instead
    const response = await request(app)
        .post(`/${v}/stocks/${personnel.id}`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});

it('when with invalid uuid data, will fail', async() => {

    const newData = {
        quantity: 20,
        unitPrice: 100.5,
        sellingPrice: 130,
    }

    const response = await request(app)
        .post(`/${v}/stocks/notauuid`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(newData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});