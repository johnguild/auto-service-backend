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
    email: 'johnrobin.autoproduct@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'John Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_MANAGER,
}

const personnelData = {
    email: 'personnel.autoproduct@gmail.com',
    mobile: '639359372676',
    password: 'P@ssW0rd',
    firstName: 'Prsonnel Robin',
    lastName: 'Perez',
    birthDay: new Date(Date.now()).toISOString(),
    gender: 'Male',
    role: User.ROLE_PERSONNEL,
}

let managerToken;
let personnelToken;


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


it('when getting using manager account, will succeed', async() => {

    const productData = [
        {
            name: 'Product 1',
            description: 'Description 1',
        },
        {
            name: 'Product 2',
            description: 'Description 1',
        },
        {
            name: 'Product 3',
            description: 'Description 1',
        },
        {
            name: 'Product 4',
            description: 'Description 1',
        },
        {
            name: 'Product 5',
            description: 'Description 1',
        },
        
    ];

    for (const p of productData) {
        await productDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/products-search`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query({
            limit: 30,
            keyword: '4'
        })
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(1);

});


