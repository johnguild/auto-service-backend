const request = require('supertest');
const bcrypt = require('bcryptjs');
const tokenator = require('../../utils/tokenator');
const {getPool, closePool} = require('../../db/postgres');
const pool = getPool();

const migrate = require('../db_migrations/migrate');

const userDAO = require('../../user/user.dao');
const User = require('../../user/user.model');

const cashDAO = require('../../cash/cash.dao');
const Cash = require('../../cash/cash.model');

const usageDAO = require('../../cash/usage.dao');
const Usage = require('../../cash/usage.model');

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
    await pool.query(`DELETE FROM ${Cash.tableName};`);
    await pool.query(`DELETE FROM ${Usage.tableName};`);

});

afterAll( async () => {
    await migrate.down();
    await closePool();
});


it('when with valid data, will succeed', async() => {

    const cashData = {
        amount: 1000,
        purpose: 'Test'
    }

    const response = await request(app)
        .post(`/${v}/cashes`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(cashData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(200);
    expect(response.body.data).not.toBeNull();

});




it('when with invalid amount data, will fail', async() => {

    const cashData = {
        amount: 'Hello123123',
        purpose: 'Test'
    }

    const response = await request(app)
        .post(`/${v}/cashes`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(cashData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});



it('when with invalid amount data, will fail', async() => {

    const cashData = {
        amount: 'person1.autoservice@gmail.com',
        purpose: 'Test'
    }

    const response = await request(app)
        .post(`/${v}/cashes`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(cashData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(400);

});


it('when with valid data but using customer account, will succeed', async() => {

    /// create customer first
    const customerData = {
        email: 'mup.autoservice@gmail.com',
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
 

    const cashData = {
        amount: 1000,
        purpose: 'Test'
    }

    const response = await request(app)
        .post(`/${v}/cashes`)
        .set('Authorization', `Bearer ${token}`)
        .send(cashData);

    // console.dir(response.body, { depth: null });

    expect(response.status).toBe(403);
    // expect(response.body.data).not.toBeNull();

});
