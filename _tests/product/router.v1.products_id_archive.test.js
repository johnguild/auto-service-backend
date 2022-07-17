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
    const prod = await productDAO.insert(productData);

    // console.log(personnel);


    const response = await request(app)
        .post(`/${v}/products/${prod.id}/archive`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'Test Comment',
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);

    // assert product saved
    const res = await pool.query(`SELECT * FROM ${ProductArchive.tableName};`);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0].product_id).toBe(prod.id);
    expect(res.rows[0].requested_by).toBe(personnelId);
    expect(res.rows[0].requested_comment).toBe('Test Comment');
    expect(res.rows[0].requested_at).not.toBeNull();
});

it('when with non existing product id data, will fail', async() => {

    /// use personnel id instead
    const response = await request(app)
        .post(`/${v}/products/${personnelId}/archives`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'TEst Comment'
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});

it('when with invalid uuid data, will fail', async() => {


    const response = await request(app)
        .post(`/${v}/products/notauuid/archive`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'TEst Comment'
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});


it('when with product already has archive request data, will fail', async() => {

    /// create service
    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }
    const prod = await productDAO.insert(productData);
    await productDAO.insertArchive({
        productId: prod.id,
        requestedBy: personnelId,
        requestedComment: 'Hello sir',
    })

    // console.log(personnel);


    const response = await request(app)
        .post(`/${v}/products/${prod.id}/archive`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'Test Comment',
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});

it('when with product already has archive request data, will fail', async() => {

    /// create service
    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }
    const prod = await productDAO.insert(productData);
    await productDAO.insertArchive({
        productId: prod.id,
        requestedBy: personnelId,
        requestedComment: 'Hello sir',
    })

    // console.log(personnel);


    const response = await request(app)
        .post(`/${v}/products/${prod.id}/archive`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'Test Comment',
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});


it('when with product already has archive request (declined) data, will succeed', async() => {

    /// create service
    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }
    const prod = await productDAO.insert(productData);
    const archive = await productDAO.insertArchive({
        productId: prod.id,
        requestedBy: personnelId,
        requestedComment: 'Hello sir',
    })
    await productDAO.updateArchive(
        {declinedBy: personnelId, declinedAt: new Date().toISOString()},
        {id: archive.id}
    )

    // console.log(personnel);


    const response = await request(app)
        .post(`/${v}/products/${prod.id}/archive`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'New Request Comment',
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);


    // assert product saved
    const res = await pool.query(`SELECT * FROM ${ProductArchive.tableName}
        ORDER BY requested_at DESC;`);
    expect(res.rows.length).toBe(2);
    expect(res.rows[0].product_id).toBe(prod.id);
    expect(res.rows[0].requested_by).toBe(personnelId);
    expect(res.rows[0].requested_comment).toBe('New Request Comment');
    expect(res.rows[0].declined_by).toBeNull();
    expect(res.rows[0].declined_at).toBeNull();


    expect(res.rows[1].product_id).toBe(prod.id);
    expect(res.rows[1].requested_by).toBe(personnelId);
    expect(res.rows[1].requested_comment).toBe('Hello sir');
    expect(res.rows[1].requested_at).not.toBeNull();
    expect(res.rows[1].declined_by).not.toBeNull();
    expect(res.rows[1].declined_at).not.toBeNull();

});


it('when with product already has archive request (approved) data, will fail', async() => {

    /// create service
    const productData = {
        name: 'Product 1',
        description: 'Description 1',
    }
    const prod = await productDAO.insert(productData);
    const archive = await productDAO.insertArchive({
        productId: prod.id,
        requestedBy: personnelId,
        requestedComment: 'Hello sir',
    })
    await productDAO.updateArchive(
        {approvedBy: personnelId, approvedAt: new Date().toISOString()},
        {id: archive.id}
    )

    // console.log(personnel);


    const response = await request(app)
        .post(`/${v}/products/${prod.id}/archive`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            comment: 'New Request Comment',
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(404);

});