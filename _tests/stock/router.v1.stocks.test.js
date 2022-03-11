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
    sku: '123456',
    description: 'Description 1',
}

let personnel, personnelToken, product;


beforeAll( async () => {
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

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Stock.tableName};`);

});

afterAll( async () => {
    await userMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const stockData = {
        productId: product.id,
        supplier: 'Some Supplier',
        quantity: 120,
        unitPrice: 300.5,
        sellingPrice: 330,
    }

    const response = await request(app)
        .post(`/${v}/stocks`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(stockData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with required only data, will succeed', async() => {

    const stockData = {
        productId: product.id,
        supplier: 'Some Supplier',
        quantity: 120,
        unitPrice: 300.5,
        sellingPrice: 330,
    }

    const response = await request(app)
        .post(`/${v}/stocks`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(stockData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});

it('when with no quantity and sellingPrice data, will fail', async() => {

    const stockData = {
        productId: product.id,
        personnelId: personnel.id,
        supplier: 'Some Supplier',
        unitPrice: 300.5,
    }


    const response = await request(app)
        .post(`/${v}/stocks`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send(stockData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autostock@gmail.com',
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
 

    const stockData = {
        productId: product.id,
        supplier: 'Some Supplier',
        quantity: 120,
        unitPrice: 300.5,
        sellingPrice: 330,
    }

    const response = await request(app)
        .post(`/${v}/stocks`)
        .set('Authorization', `Bearer ${token}`)
        .send(stockData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
