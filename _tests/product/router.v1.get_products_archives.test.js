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


const managerData = {
    email: 'manager.autoservice@gmail.com',
    mobile: '0912381238',
    password: 'P@ssW0rd',
    firstName: 'Admin',
    lastName: 'Test',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_MANAGER,
}

let managerToken;

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


const personnel2Data = {
    email: 'johnrobin2.autoproduct@gmail.com',
    mobile: '639359372677',
    password: 'P@ssW0rd',
    firstName: 'John Robin 2',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_PERSONNEL,
}

let personnelToken, personnelId, personnel2Token, personnel2Id;


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


    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    const personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     

    personnelId = personnel.id;
    personnelToken = tokenator.generate({ userId: personnel.id });



    const personnel2EncryptedPass = await bcrypt.hash(personnel2Data.password, parseInt(process.env.BCRYPT_SALT));
    const personnel2 = await userDAO.insert(data = {
        ...personnel2Data,
        password: personnel2EncryptedPass,
    });     

    personnel2Id = personnel2.id;
    personnel2Token = tokenator.generate({ userId: personnel2.id });
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


it('when getting as manager, will succeed', async() => {

    /// create service
    const productData = [{
        name: 'Product 1',
        description: 'Description 1',
    }, {
        name: 'Product 2',
        description: 'Description 2',
    }, {
        name: 'Product 3',
        description: 'Description 3',
    }, {
        name: 'Product 4',
        description: 'Description 4',
    }]

    for (const p of productData) {
        const prod = await productDAO.insert(p);
        
        await productDAO.insertArchive({
            productId: prod.id,
            requestedBy: personnelId,
            requestedComment: `Archive ${prod.name}`,
        });
    }

    // console.log(personnel);


    const response = await request(app)
        .get(`/${v}/products-archives`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            page: 1,
            limit: 10
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(productData.length);

});

it('when getting as personnel, will succeed', async() => {

    /// create service
    const productData = [{
        name: 'Product 1',
        description: 'Description 1',
    }, {
        name: 'Product 2',
        description: 'Description 2',
    }, {
        name: 'Product 3',
        description: 'Description 3',
    }, {
        name: 'Product 4',
        description: 'Description 4',
    }]

    for (const p of productData) {
        const prod = await productDAO.insert(p);
        
        if (p.name == 'Product 1' || p.name == 'Product 2') {
            await productDAO.insertArchive({
                productId: prod.id,
                requestedBy: personnelId,
                requestedComment: `Archive ${prod.name}`,
            });
        }
    }

    // console.log(personnel);


    const response = await request(app)
        .get(`/${v}/products-archives`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send({
            page: 1,
            limit: 10
        });

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(2);

});

