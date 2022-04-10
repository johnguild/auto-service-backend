const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const userMigration0 = require('../../db_migrations/1641039467575_create_users_table');
const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const productMigration0 = require('../../db_migrations/1641297582352_create_products_table');
const productMigration1 = require('../../db_migrations/1647514335737_add_car_details_on_products_table');
const productDAO = require('../../product/product.dao');
const Product = require('../../product/product.model');


const stockMigration0 = require('../../db_migrations/1641300048254_create_stocks_table');
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

let managerToken, personnelToken, personnel;


beforeAll( async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 100));
    // clear db
    await userMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
    // migrate tables
    await userMigration0.up();
    await productMigration0.up();
    await productMigration1.up();
    await stockMigration0.up();


    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    const manager = await userDAO.insert(data = {
        ...managerData,
        password: managerEncryptedPass,
    });     
    
    managerToken = tokenator.generate({ userId: manager.id });



    const personnelEncryptedPass = await bcrypt.hash(personnelData.password, parseInt(process.env.BCRYPT_SALT));
    personnel = await userDAO.insert(data = {
        ...personnelData,
        password: personnelEncryptedPass,
    });     
    
    personnelToken = tokenator.generate({ userId: personnel.id });
});

beforeEach( async () => {
    await pool.query(`DELETE FROM ${Product.tableName};`);
    await pool.query(`DELETE FROM ${Stock.tableName};`);

});

afterAll( async () => {
    await userMigration0.down();
    await productMigration0.down();
    await stockMigration0.down();
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
        .get(`/${v}/products`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(productData.length);

});

it('when getting using personnel account, will succeed', async() => {

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
        .get(`/${v}/products`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(productData.length);

});

it('when getting with stocks, will succeed', async() => {

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

    let index = 0;
    for (const p of productData) {
        const prod = await productDAO.insert(p);

        if (index < 3) {
            await stockDAO.insert({
                productId: prod.id,
                personnelId: personnel.id,
                supplier: 'Test Supplier',
                quantity: index == 0 ? 0 : 100,
                unitPrice: 320,
                sellingPrice: 390.5,
            });

            await stockDAO.insert({
                productId: prod.id,
                personnelId: personnel.id,
                supplier: 'Test Supplier',
                quantity: index == 2 ? 0 : 200,
                unitPrice: 60,
                sellingPrice: 90.5,
            });
        }
        index++;
    }


    const response = await request(app)
        .get(`/${v}/products`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(productData.length);

});

it('when getting with page and limit, will succeed', async() => {

    
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

    const queryParams = {
        page: 2,
        limit: 2,
    }

    const response = await request(app)
        .get(`/${v}/products`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
