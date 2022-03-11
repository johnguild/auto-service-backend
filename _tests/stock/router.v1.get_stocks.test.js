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

const productData = {
    name: 'Product 1',
    sku: '123456',
    description: 'Description 1',
}


const product2Data = {
    name: 'Product 2',
    sku: '00222',
    description: 'Description 2',
}


let managerToken, manager, personnelToken, personnel, product, product2;


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


    const managerEncryptedPass = await bcrypt.hash(managerData.password, parseInt(process.env.BCRYPT_SALT));
    manager = await userDAO.insert(data = {
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

    product = await productDAO.insert(productData);
    product2 = await productDAO.insert(product2Data);
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


it('when getting using manager account, will succeed', async() => {

    const stockData = [
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 120,
            unitPrice: 300.5,
            sellingPrice: 330,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 100,
            unitPrice: 100.5,
            sellingPrice: 130,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 220,
            unitPrice: 200.5,
            sellingPrice: 230,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 420,
            unitPrice: 400.5,
            sellingPrice: 430,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 520,
            unitPrice: 500.5,
            sellingPrice: 530,
        },
        
    ];

    for (const p of stockData) {
        await stockDAO.insert(p);
    }


    const response = await request(app)
        .get(`/${v}/stocks`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(stockData.length);

});

it('when getting using personnel account, will succeed', async() => {

   
    const stockData = [
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 120,
            unitPrice: 300.5,
            sellingPrice: 330,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 100,
            unitPrice: 100.5,
            sellingPrice: 130,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 220,
            unitPrice: 200.5,
            sellingPrice: 230,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 420,
            unitPrice: 400.5,
            sellingPrice: 430,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 520,
            unitPrice: 500.5,
            sellingPrice: 530,
        },
        
    ];

    for (const p of stockData) {
        await stockDAO.insert(p);
    }

    const response = await request(app)
        .get(`/${v}/stocks`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(stockData.length);

});

it('when getting using productId account, will succeed', async() => {

   
    const stockData = [
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 120,
            unitPrice: 300.5,
            sellingPrice: 330,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 100,
            unitPrice: 100.5,
            sellingPrice: 130,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 220,
            unitPrice: 200.5,
            sellingPrice: 230,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 420,
            unitPrice: 400.5,
            sellingPrice: 430,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 520,
            unitPrice: 500.5,
            sellingPrice: 530,
        },
        /// producct2
        {
            productId: product2.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 420,
            unitPrice: 400.5,
            sellingPrice: 430,
        },
        {
            productId: product2.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 520,
            unitPrice: 500.5,
            sellingPrice: 530,
        },
        
    ];

    for (const p of stockData) {
        await stockDAO.insert(p);
    }

    const response = await request(app)
        .get(`/${v}/stocks`)
        .set('Authorization', `Bearer ${personnelToken}`)
        .query({
            productId: product.id,
        })
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(5);

});

it('when getting with page and limit, will succeed', async() => {

    
    
    const stockData = [
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 120,
            unitPrice: 300.5,
            sellingPrice: 330,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 100,
            unitPrice: 100.5,
            sellingPrice: 130,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 220,
            unitPrice: 200.5,
            sellingPrice: 230,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 420,
            unitPrice: 400.5,
            sellingPrice: 430,
        },
        {
            productId: product.id,
            personnelId: personnel.id,
            supplier: 'Some Supplier',
            quantity: 520,
            unitPrice: 500.5,
            sellingPrice: 530,
        },
        
    ];

    for (const p of stockData) {
        await stockDAO.insert(p);
    }

    const queryParams = {
        page: 2,
        limit: 2,
    }

    const response = await request(app)
        .get(`/${v}/stocks`)
        .set('Authorization', `Bearer ${managerToken}`)
        .query(queryParams)
        .send();

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();
    expect(response.body.data.length).toBe(queryParams.limit);

});
