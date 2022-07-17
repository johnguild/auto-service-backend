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
        DELETE FROM ${Service.tableName};
        DELETE FROM ${Stock.tableName};
    `);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when getting data without page, will succeed', async() => {


    const product1 = await productDAO.insert({
        name: 'test prod',
        description: 'desc',
    });

    const product2 = await productDAO.insert({
        name: 'test prod 2',
        description: 'desc',
    });

    const serviceData = [
        {
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 2',
            description: 'Something here',
            cover: 'base64string',
            price: 300.2,
            discountedPrice: undefined,
            isPublic: true,
            products: [],
        },
        {
            title: 'Repair Service 3',
            description: 'Something here',
            cover: 'base64string',
            price: 200.2,
            discountedPrice: undefined,
            isPublic: true,
            products: [
                product1.id,
            ],
        },
        {
            title: 'Repair Service 4',
            description: 'Something here',
            cover: 'base64string',
            price: 600.2,
            discountedPrice: undefined,
            isPublic: true,
            products: [
                product1.id,
                product2.id,
            ],
        },
        {
            title: 'Repair Service 5',
            description: 'Something here',
            cover: 'base64string',
            price: 500,
            discountedPrice: undefined,
            isPublic: false,
        },
        
    ];

    for (const p of serviceData) {
        await serviceDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(serviceData.length);

});



it('when getting data without page and limit, will succeed', async() => {

    
    const serviceData = [
        {
            title: 'Repair Service',
            description: 'Something here',
            cover: 'base64string',
            price: 100.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 2',
            description: 'Something here',
            cover: 'base64string',
            price: 300.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 3',
            description: 'Something here',
            cover: 'base64string',
            price: 200.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 4',
            description: 'Something here',
            cover: 'base64string',
            price: 600.2,
            discountedPrice: undefined,
            isPublic: true,
        },
        {
            title: 'Repair Service 5',
            description: 'Something here',
            cover: 'base64string',
            price: 500,
            discountedPrice: undefined,
            isPublic: false,
        },
        
    ];

    for (const p of serviceData) {
        await serviceDAO.insert(p);
    }

    const queryParams = {
        page: 2,
        limit: 1,
    }

    const response = await request(app)
        .get(`/${v}/services`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
